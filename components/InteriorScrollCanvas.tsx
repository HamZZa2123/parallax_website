"use client";

import { useScrollProgress } from "@/lib/scroll-context";
import { drawCover } from "@/lib/canvas/draw-cover";
import {
  buildFrameUrl,
  heroBlendEase,
  progressToBlend,
  type ProgressToBlendOptions,
  scrollProgressToScene,
  tryParallelTailDraw,
} from "@/lib/interior/sequence";
import { SITE } from "@/lib/siteConfig";
import { canvasBackground } from "@/lib/theme/tokens";
import { useReducedMotion, useMotionValueEvent } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

const {
  totalFrames,
  sequencePath,
  sequenceExt,
  frameOrder,
  sequenceCompleteAt,
  mergeLastFramesInOneScroll,
  slideIncomingFromBottom,
  slideIncomingFromLeft,
} = SITE;

const SLIDE_INCOMING_FROM_BOTTOM = new Set<number>(slideIncomingFromBottom);
const SLIDE_INCOMING_FROM_LEFT = new Set<number>(slideIncomingFromLeft);

const BLEND_OPTS: ProgressToBlendOptions | undefined =
  mergeLastFramesInOneScroll >= 2
    ? { mergeLastFrames: mergeLastFramesInOneScroll }
    : undefined;

const SEQUENCE_LEN = frameOrder.length;
/** Son iki dosya varsayılan üstten; `slideIncomingFromBottom` ile istisna. */
const PENULTIMATE_FRAME = frameOrder[SEQUENCE_LEN - 2]!;
const LAST_FRAME = frameOrder[SEQUENCE_LEN - 1]!;

/** Soldan giriş: ease-out ile bitişe doğru yavaşlar (lineer t’ye göre daha yumuşak). */
function easeSlideFromLeft(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - (1 - x) ** 2.6;
}

export function InteriorScrollCanvas() {
  const scrollYProgress = useScrollProgress();
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const loadingRef = useRef<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const [preloadStatus, setPreloadStatus] = useState<"idle" | "loading" | "ready">(
    "idle"
  );
  /** Reduced-motion slider: step along `frameOrder` (1…SEQUENCE_LEN). */
  const [sequenceStep, setSequenceStep] = useState(
    Math.min(SEQUENCE_LEN, Math.max(1, Math.ceil(SEQUENCE_LEN / 2)))
  );

  const ensureImage = useCallback((frame: number): Promise<HTMLImageElement | null> => {
    const cached = imagesRef.current.get(frame);
    if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
    if (loadingRef.current.has(frame)) {
      return new Promise((resolve) => {
        const check = () => {
          const img = imagesRef.current.get(frame);
          if (img?.complete && img.naturalWidth > 0) resolve(img);
          else requestAnimationFrame(check);
        };
        check();
      });
    }
    loadingRef.current.add(frame);
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        imagesRef.current.set(frame, img);
        loadingRef.current.delete(frame);
        resolve(img);
      };
      img.onerror = () => {
        loadingRef.current.delete(frame);
        resolve(null);
      };
      img.src = buildFrameUrl(frame, sequencePath, sequenceExt);
    });
  }, []);

  /** Batch preload: prime first 24 frames, then rest with limited concurrency */
  useEffect(() => {
    let cancelled = false;
    const concurrency = 6;

    async function run() {
      setPreloadStatus("loading");
      const order: number[] = [];
      const first = 24;
      for (let i = 1; i <= Math.min(first, totalFrames); i++) order.push(i);
      for (let i = first + 1; i <= totalFrames; i++) order.push(i);

      const queue = [...order];
      const workers = Array.from({ length: concurrency }, async () => {
        while (queue.length && !cancelled) {
          const n = queue.shift();
          if (n === undefined) break;
          await ensureImage(n);
        }
      });
      await Promise.all(workers);
      if (!cancelled) setPreloadStatus("ready");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ensureImage]);

  const drawProgress = useCallback(
    (sceneProgress: number) => {
      const canvas = canvasRef.current;
      const wrap = containerRef.current;
      if (!canvas || !wrap) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const bw = Math.floor(w * dpr);
      const bh = Math.floor(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, bw, bh);

      const blendP = heroBlendEase(sceneProgress);
      const parallel =
        mergeLastFramesInOneScroll >= 2
          ? tryParallelTailDraw(blendP, frameOrder, mergeLastFramesInOneScroll)
          : { parallel: false as const };

      ctx.save();
      ctx.scale(dpr, dpr);

      if (parallel.parallel) {
        const { u, stackLastIdx } = parallel;
        for (let idx = 0; idx <= stackLastIdx; idx++) {
          const fn = frameOrder[idx]!;
          const img = imagesRef.current.get(fn);
          if (img?.complete && img.naturalWidth > 0) {
            drawCover(ctx, img, w, h, "bottom");
          }
        }
        const slideFromTopY = -(1 - u) * h;
        const slideFromBottomY = (1 - u) * h;
        const slideFromIdx = SEQUENCE_LEN - mergeLastFramesInOneScroll;
        for (let k = slideFromIdx; k < SEQUENCE_LEN; k++) {
          const fn = frameOrder[k]!;
          const img = imagesRef.current.get(fn);
          if (!img?.complete || img.naturalWidth <= 0) continue;
          ctx.save();
          ctx.translate(
            0,
            SLIDE_INCOMING_FROM_BOTTOM.has(fn) ? slideFromBottomY : slideFromTopY
          );
          drawCover(ctx, img, w, h, "bottom");
          ctx.restore();
        }
        ctx.restore();
        return;
      }

      const { a, b, t, fromIndex } = progressToBlend(blendP, frameOrder, BLEND_OPTS);
      for (let idx = 0; idx <= fromIndex; idx++) {
        const fn = frameOrder[idx]!;
        const img = imagesRef.current.get(fn);
        if (img?.complete && img.naturalWidth > 0) {
          drawCover(ctx, img, w, h, "bottom");
        }
      }
      if (a !== b) {
        const imgB = imagesRef.current.get(b);
        if (imgB?.complete && imgB.naturalWidth > 0) {
          ctx.save();
          if (SLIDE_INCOMING_FROM_LEFT.has(b)) {
            const p = easeSlideFromLeft(t);
            ctx.translate(-(1 - p) * w, 0);
          } else {
            const fromTop =
              (b === LAST_FRAME || b === PENULTIMATE_FRAME) &&
              !SLIDE_INCOMING_FROM_BOTTOM.has(b);
            ctx.translate(0, fromTop ? -(1 - t) * h : (1 - t) * h);
          }
          drawCover(ctx, imgB, w, h, "bottom");
          ctx.restore();
        }
      }
      ctx.restore();
    },
    []
  );

  const scheduleDraw = useCallback(
    (rawScrollProgress: number) => {
      const scene = scrollProgressToScene(rawScrollProgress, sequenceCompleteAt);
      const eased = heroBlendEase(scene);
      const par =
        mergeLastFramesInOneScroll >= 2
          ? tryParallelTailDraw(eased, frameOrder, mergeLastFramesInOneScroll)
          : { parallel: false as const };
      const { fromIndex } = progressToBlend(eased, frameOrder, BLEND_OPTS);
      const framesNeeded =
        par.parallel
          ? [...frameOrder]
          : [...frameOrder.slice(0, fromIndex + 2)];
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        void Promise.all(framesNeeded.map((fn) => ensureImage(fn))).then(() =>
          drawProgress(scene)
        );
      });
    },
    [drawProgress, ensureImage]
  );

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (reduced) return;
    scheduleDraw(latest);
  });

  useEffect(() => {
    if (reduced) return;
    scheduleDraw(scrollYProgress.get());
  }, [reduced, scheduleDraw, scrollYProgress]);

  useEffect(() => {
    if (reduced) return;
    const wrap = containerRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      scheduleDraw(scrollYProgress.get());
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [reduced, scheduleDraw, scrollYProgress]);

  const onSlider = (e: ChangeEvent<HTMLInputElement>) => {
    setSequenceStep(Number(e.target.value));
  };

  const reducedProgress =
    SEQUENCE_LEN <= 1 ? 0 : (sequenceStep - 1) / (SEQUENCE_LEN - 1);
  const reducedEased = heroBlendEase(reducedProgress);
  const { a: reducedA, b: reducedB, t: reducedT } = progressToBlend(
    reducedEased,
    frameOrder,
    BLEND_OPTS
  );

  useEffect(() => {
    if (!reduced) return;
    const eased = heroBlendEase(reducedProgress);
    const par =
      mergeLastFramesInOneScroll >= 2
        ? tryParallelTailDraw(eased, frameOrder, mergeLastFramesInOneScroll)
        : { parallel: false as const };
    const { fromIndex } = progressToBlend(eased, frameOrder, BLEND_OPTS);
    const frames = [
      ...(par.parallel ? frameOrder : frameOrder.slice(0, fromIndex + 2)),
    ];
    void Promise.all(frames.map((fn) => ensureImage(fn))).then(() =>
      drawProgress(reducedProgress)
    );
  }, [reduced, reducedProgress, ensureImage, drawProgress]);

  useEffect(() => {
    if (!reduced) return;
    const ro = new ResizeObserver(() => drawProgress(reducedProgress));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [reduced, reducedProgress, drawProgress]);

  if (reduced) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 bg-base"
        role="region"
        aria-label="Interior sequence. Use the slider to change frames."
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />
        <div className="absolute bottom-8 left-1/2 z-10 w-[min(90vw,28rem)] -translate-x-1/2 px-4">
          <label className="sr-only" htmlFor="frame-slider">
            Frame in sequence
          </label>
          <input
            id="frame-slider"
            type="range"
            min={1}
            max={SEQUENCE_LEN}
            value={sequenceStep}
            onChange={onSlider}
            className="w-full accent-[var(--color-accent)]"
          />
          <p className="mt-2 text-center font-body text-xs text-warm-light/70">
            Step {sequenceStep} / {SEQUENCE_LEN} — image {reducedB} from bottom (
            {Math.round(reducedT * 100)}%)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 bg-base">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      />
      <span className="sr-only" aria-live="polite">
        Second image slides up from below as you scroll.
        {preloadStatus === "loading" && " Loading frames."}
        {preloadStatus === "ready" && " All frames ready."}
      </span>
    </div>
  );
}

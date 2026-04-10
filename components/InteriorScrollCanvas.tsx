"use client";

import { useScrollProgress } from "@/lib/scroll-context";
import { drawCover } from "@/lib/canvas/draw-cover";
import { buildFrameUrl, progressToFileNumber } from "@/lib/interior/sequence";
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

const { totalFrames, sequencePath, sequenceExt, frameOrder } = SITE;

const SEQUENCE_LEN = frameOrder.length;

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

  const drawFrame = useCallback(
    (frame: number) => {
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

      const img = imagesRef.current.get(frame);
      if (img?.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.scale(dpr, dpr);
        drawCover(ctx, img, w, h);
        ctx.restore();
      }
    },
    []
  );

  const scheduleDraw = useCallback(
    (progress: number) => {
      const frame = progressToFileNumber(progress, frameOrder);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        void ensureImage(frame).then(() => drawFrame(frame));
      });
    },
    [drawFrame, ensureImage]
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

  const reducedFileNumber = frameOrder[sequenceStep - 1]!;

  useEffect(() => {
    if (!reduced) return;
    void ensureImage(reducedFileNumber).then(() => drawFrame(reducedFileNumber));
  }, [reduced, reducedFileNumber, ensureImage, drawFrame]);

  useEffect(() => {
    if (!reduced) return;
    const ro = new ResizeObserver(() => drawFrame(reducedFileNumber));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [reduced, reducedFileNumber, drawFrame]);

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
            Step {sequenceStep} / {SEQUENCE_LEN} (image {reducedFileNumber})
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
        Scroll-driven interior sequence from empty room to finished space.
        {preloadStatus === "loading" && " Loading frames."}
        {preloadStatus === "ready" && " All frames ready."}
      </span>
    </div>
  );
}

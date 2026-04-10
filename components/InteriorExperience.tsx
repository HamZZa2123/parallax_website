"use client";

import { useScrollProgress } from "@/lib/scroll-context";
import { SITE } from "@/lib/siteConfig";
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

const PHASES = [
  {
    id: "empty",
    start: 0,
    end: 0.25,
    lines: ["Space begins", "Silence. Volume. Light."],
    align: "items-end justify-start text-left pb-10 pl-6 md:pl-10",
  },
  {
    id: "forming",
    start: 0.25,
    end: 0.6,
    lines: ["Material emerges", "Light finds surfaces"],
    align: "items-start justify-end text-right pr-6 pt-10 md:pr-10",
  },
  {
    id: "design",
    start: 0.6,
    end: 0.85,
    lines: ["Function meets emotion", "Living takes shape"],
    align: "items-end justify-end text-right pb-10 pr-6 md:pr-10",
  },
  {
    id: "final",
    start: 0.85,
    end: 1,
    lines: ["Designed for living", SITE.studioName],
    align: "items-start justify-start text-left pt-10 pl-6 md:pl-10",
  },
] as const;

function smoothstep01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Fade in at start, hold, fade out at end — no harsh cuts between phases */
function phaseOpacity(p: number, start: number, end: number, fade = 0.07) {
  if (p < start || p > end) return 0;
  const span = end - start;
  const fi = Math.min(fade, span / 3);
  if (p < start + fi) return smoothstep01((p - start) / fi);
  if (p > end - fi) return smoothstep01((end - p) / fi);
  return 1;
}

export function InteriorExperience() {
  const scrollYProgress = useScrollProgress();
  const reduced = useReducedMotion();
  const hudY = useTransform(scrollYProgress, (p: number) =>
    reduced ? 0 : -14 * p
  );

  return (
    <motion.div
      style={{ y: hudY }}
      className="pointer-events-none absolute inset-0 z-20 flex"
    >
      {PHASES.map((phase) => (
        <PhaseBlock
          key={phase.id}
          phase={phase}
          progress={scrollYProgress}
          reduced={!!reduced}
        />
      ))}
    </motion.div>
  );
}

function PhaseBlock({
  phase,
  progress,
  reduced,
}: {
  phase: (typeof PHASES)[number];
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const opacity = useTransform(progress, (p: number) =>
    phaseOpacity(p, phase.start, phase.end)
  );
  const innerY = useTransform(progress, (p: number) => {
    if (reduced) return 0;
    const w = phaseOpacity(p, phase.start, phase.end);
    return w > 0 ? (1 - w) * 10 : 12;
  });

  return (
    <motion.div
      className={`absolute inset-0 flex ${phase.align}`}
      style={{ opacity }}
    >
      <div className="max-w-[min(90vw,22rem)] space-y-3 md:max-w-md">
        {phase.lines.map((line, i) => (
          <motion.p
            key={line}
            style={{ y: innerY }}
            className="font-heading text-lg leading-snug tracking-wide text-warm-light/90 md:text-xl"
          >
            {i === 1 ? (
              <span className="text-accent/95">{line}</span>
            ) : (
              <span className="text-warm-light/95">{line}</span>
            )}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

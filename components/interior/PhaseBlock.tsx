"use client";

import type { InteriorPhase } from "@/lib/content/interior-phases";
import { phaseOpacity } from "@/lib/interior/phase-opacity";
import { motion, useTransform, type MotionValue } from "framer-motion";

export type PhaseBlockProps = {
  phase: InteriorPhase;
  progress: MotionValue<number>;
  reduced: boolean;
};

export function PhaseBlock({ phase, progress, reduced }: PhaseBlockProps) {
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

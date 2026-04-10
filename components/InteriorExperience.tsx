"use client";

import { PhaseBlock } from "@/components/interior/PhaseBlock";
import { createInteriorPhases } from "@/lib/content/interior-phases";
import { useScrollProgress } from "@/lib/scroll-context";
import { SITE } from "@/lib/siteConfig";
import { motion, useReducedMotion, useTransform } from "framer-motion";

const PHASES = createInteriorPhases(SITE.studioName);

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

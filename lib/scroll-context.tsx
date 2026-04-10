"use client";

import type { MotionValue } from "framer-motion"; 
import { createContext, useContext, type ReactNode } from "react";

const ScrollProgressContext = createContext<MotionValue<number> | null>(null);

export function ScrollProgressProvider({
  value,
  children,
}: {
  value: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function useScrollProgress() {
  const ctx = useContext(ScrollProgressContext);
  if (!ctx) {
    throw new Error("useScrollProgress must be used within ScrollProgressProvider");
  }
  return ctx;
}

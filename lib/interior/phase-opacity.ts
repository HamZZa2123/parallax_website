function smoothstep01(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Fade in at start, hold, fade out at end — no harsh cuts between phases */
export function phaseOpacity(p: number, start: number, end: number, fade = 0.07) {
  if (p < start || p > end) return 0;
  const span = end - start;
  const fi = Math.min(fade, span / 3);
  if (p < start + fi) return smoothstep01((p - start) / fi);
  if (p > end - fi) return smoothstep01((end - p) / fi);
  return 1;
}

export function buildFrameUrl(
  fileNumber: number,
  sequencePath: string,
  sequenceExt: string
) {
  return `${sequencePath}/${fileNumber}.${sequenceExt}`;
}

/** Maps scroll progress 0…1 to on-disk frame number using `frameOrder`. */
export function progressToFileNumber(
  p: number,
  frameOrder: readonly number[]
): number {
  const SEQUENCE_LEN = frameOrder.length;
  const clamped = Math.min(1, Math.max(0, p));
  const idx = Math.round(clamped * (SEQUENCE_LEN - 1));
  return frameOrder[idx]!;
}

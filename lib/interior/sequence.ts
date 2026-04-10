/** Maps raw hero scroll 0…1 to scene progress; hits 1 when raw ≥ `sequenceCompleteAt`. */
export function scrollProgressToScene(raw: number, sequenceCompleteAt: number) {
  const c = Math.max(0.001, sequenceCompleteAt);
  return Math.min(1, Math.max(0, raw / c));
}

/**
 * Ease-out on scene progress before blend: second image “lands” into place toward the end of the
 * scroll instead of lingering at 50/50 parquet vs room.
 */
export function heroBlendEase(scene: number): number {
  const x = Math.min(1, Math.max(0, scene));
  return 1 - (1 - x) * (1 - x);
}

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

export type ProgressToBlendOptions = {
  /** Son K kareyi tek makro scroll diliminde birleştir (ör. 3 → 5→6 ve 6→7 aynı bandda). */
  mergeLastFrames?: number;
};

/**
 * Adjacent pair (a→b) with local mix t, and `fromIndex` = index of `a` in `frameOrder`.
 * All frames with index < fromIndex stay drawn underneath; `b` slides in on top.
 */
export function progressToBlend(
  p: number,
  frameOrder: readonly number[],
  opts?: ProgressToBlendOptions
): { a: number; b: number; t: number; fromIndex: number } {
  const len = frameOrder.length;
  if (len < 1) return { a: 1, b: 1, t: 0, fromIndex: 0 };
  if (len === 1) {
    const only = frameOrder[0]!;
    return { a: only, b: only, t: 0, fromIndex: 0 };
  }

  const mergeK = opts?.mergeLastFrames;
  const clamped = Math.min(1, Math.max(0, p));

  const macroCountIfMerge = mergeK != null ? len - mergeK : 0;
  if (
    mergeK == null ||
    mergeK < 2 ||
    len < mergeK ||
    mergeK > len ||
    macroCountIfMerge < 1
  ) {
    const pos = clamped * (len - 1);
    const i = Math.min(len - 2, Math.floor(pos));
    const localT = pos - i;
    return { a: frameOrder[i]!, b: frameOrder[i + 1]!, t: localT, fromIndex: i };
  }

  /**
   * Makro dilim: (len−1) geçişten son K kareyi tek banttaki (K−1) geçişe sıkıştırırız
   * → dilim sayısı = len − K (ör. 7 kare, K=3 → 4 dilim: 1→2, 2→3, 3→4, sonra 5+6+7 birlikte).
   */
  const macroCount = len - mergeK;
  const pos = clamped * macroCount;
  const seg = Math.min(macroCount - 1, Math.floor(pos));
  const u = pos - seg;

  if (seg < macroCount - 1) {
    return {
      a: frameOrder[seg]!,
      b: frameOrder[seg + 1]!,
      t: u,
      fromIndex: seg,
    };
  }

  /** Son dilim: 5,6,7 çizimi `tryParallelTailDraw` + canvas. */
  return {
    a: frameOrder[len - 2]!,
    b: frameOrder[len - 1]!,
    t: u,
    fromIndex: len - mergeK - 1,
  };
}

/**
 * Son makro dilimdeysek: altta 1…(len−K), üstte K kare aynı u ile üstten kayar.
 */
export function tryParallelTailDraw(
  blendP: number,
  frameOrder: readonly number[],
  mergeK: number
): { parallel: true; u: number; stackLastIdx: number } | { parallel: false } {
  const len = frameOrder.length;
  if (mergeK < 2 || len < mergeK) return { parallel: false };

  const macroCount = len - mergeK;
  if (macroCount < 1) return { parallel: false };
  const clamped = Math.min(1, Math.max(0, blendP));
  const pos = clamped * macroCount;
  const seg = Math.min(macroCount - 1, Math.floor(pos));
  const u = pos - seg;
  if (seg < macroCount - 1) return { parallel: false };

  return {
    parallel: true,
    u,
    stackLastIdx: len - mergeK - 1,
  };
}

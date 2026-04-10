import { withBasePath } from "@/lib/basePath";

export const SITE = {
  studioName: "Mimarlık ve Tasarım Hizmetleri",
  /** Number of files on disk: `1.png` … `{totalFrames}.png` in `public/images/interior-sequence/` */
  totalFrames: 7,
  /**
   * Scroll sırası (dosya numaraları). Son iki öğe `mergeLastFramesInOneScroll: 2` ile birlikte iner.
   * 6, 5’ten önce (4→6) gelir; son bantta 5 ve 7 birlikte alttan kayar.
   */
  frameOrder: [1, 2, 3, 4, 6, 5, 7] as const,
  /**
   * Son N kareyi tek scroll diliminde birleştirir (N≥2). 0 = her komşu çift ayrı dilim.
   * N=2 + yukarıdaki sıra → 5 ve 7 aynı bantta; ikisi de `slideIncomingFromBottom` ile alttan.
   */
  mergeLastFramesInOneScroll: 2,
  /** Bu dosya numaraları gelirken alttan kayar (diğerleri son iki kare kuralında üstten). */
  slideIncomingFromBottom: [5, 7] as const,
  /** Bu dosya numaraları gelirken soldan kayar (yatay; diğer kurallarla birleşmez). */
  slideIncomingFromLeft: [3] as const,
  /** Sticky-scroll height — higher when more frames so each blend has room. */
  scrollLengthVh: 400,
  /**
   * 1 = raw scroll 0…1 maps fully to scene 0…1 (no early “stuck” second image while scroll continues).
   */
  sequenceCompleteAt: 1,
  sequencePath: withBasePath("/images/interior-sequence"),
  /** Frame file extension (no dot): jpg, png, or webp */
  sequenceExt: "png" as const,
} as const;

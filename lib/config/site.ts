import { withBasePath } from "@/lib/basePath";

export const SITE = {
  studioName: "Atelier Meridian",
  /** Number of files on disk: `1` … `totalFrames` in `public/images/interior-sequence/` */
  totalFrames: 4,
  /** Scroll order: `1.png` → `2.png` → `3.png` → `4.png` as user scrolls. */
  frameOrder: [1, 2, 3, 4] as const,
  scrollLengthVh: 400,
  sequencePath: withBasePath("/images/interior-sequence"),
  /** Frame file extension (no dot): jpg, png, or webp */
  sequenceExt: "png" as const,
} as const;

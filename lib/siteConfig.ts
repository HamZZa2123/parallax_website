export const SITE = {
  studioName: "Atelier Meridian",
  /** Number of files on disk: `1` … `totalFrames` in `public/images/interior-sequence/` */
  totalFrames: 4,
  /** Scroll order: which file number to show from start → end of scroll. */
  frameOrder: [1, 4, 3, 2] as const,
  scrollLengthVh: 400,
  sequencePath: "/images/interior-sequence",
  /** Frame file extension (no dot): jpg, png, or webp */
  sequenceExt: "png" as const,
} as const;

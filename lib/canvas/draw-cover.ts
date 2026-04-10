export type DrawCoverVertical = "center" | "bottom" | "top";

/** object-fit: cover in canvas coordinates */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  vertical: DrawCoverVertical = "center"
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  let dy: number;
  if (vertical === "bottom") dy = ch - dh;
  else if (vertical === "top") dy = 0;
  else dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * GitHub Pages project sites live under `https://user.github.io/repo-name/`.
 * Set `NEXT_PUBLIC_BASE_PATH=/repo-name` when building for that deploy (no trailing slash).
 */
export function getBasePath(): string {
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
}

/** Prefix a root-absolute public path, e.g. `/logo.svg` → `/parallax_website/logo.svg`. */
export function withBasePath(absolutePath: string): string {
  const base = getBasePath();
  const path = absolutePath.startsWith("/") ? absolutePath : `/${absolutePath}`;
  return `${base}${path}`;
}

import type { NextConfig } from "next";

const basePath =
  (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "") || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(basePath != null && basePath !== "" ? { basePath } : {}),
};

export default nextConfig;

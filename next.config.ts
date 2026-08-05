import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Served by the OpenNext Worker (SSR + route handlers + D1), not a static export.
  images: { unoptimized: true },
};

export default nextConfig;

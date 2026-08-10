import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Served by the OpenNext Worker (SSR + route handlers + D1), not a static export.
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      // Default is 1MB, which every logo/banner/profile-photo upload exceeds —
      // those go through server actions (createOrUpdateBrandAction etc), not a
      // route handler. Matches the 5MB cap enforced in lib/storage.ts, plus
      // headroom for multipart overhead and the rest of the form fields.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

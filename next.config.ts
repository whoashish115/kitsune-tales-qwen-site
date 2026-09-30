import type { NextConfig } from "next";

// Fully static export: the site has no server code and deploys to Vercel, GitHub Pages or a static HF Space.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

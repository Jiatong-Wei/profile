import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/profile",
  assetPrefix: "/profile",
  images: {
    unoptimized: true
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/profile",
  assetPrefix: "/profile",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mapmyvisitors.com"
      }
    ]
  }
};

export default nextConfig;

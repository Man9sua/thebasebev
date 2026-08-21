import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: "/page65953477.html", destination: "/", statusCode: 301 },
      { source: "/page65953593.html", destination: "/", statusCode: 301 },
      { source: "/raf-cofeee", destination: "/raf-coffee", statusCode: 301 },
      { source: "/raf-cofee", destination: "/raf-coffee", statusCode: 301 },
      { source: "/functional-wellness", destination: "/catalog", statusCode: 301 },
    ];
  },
};

export default nextConfig;

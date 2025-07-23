import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveAlias: {
      canvas: './empty.js'
    }
  }
};

export default nextConfig;

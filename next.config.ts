import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for optimal Docker build tracing
  reactStrictMode: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@fittrack/shared-types"]
};

export default nextConfig;

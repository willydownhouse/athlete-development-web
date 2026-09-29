import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel needs the default build traces (next-server.js.nft.json).
  // Docker uses the standalone server.js output.
  output: process.env["VERCEL"] ? undefined : "standalone",
  poweredByHeader: false,
};

export default nextConfig;

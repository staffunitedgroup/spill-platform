import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: "export",
  images: { unoptimized: true },
  outputFileTracingIncludes: {
    "/partner/investors/overview/document": ["./src/private/investor-overview.pdf"],
  },
};

export default nextConfig;

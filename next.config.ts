import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "agroplastic.cl",
      },
    ],
  },
};

export default nextConfig;

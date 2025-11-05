import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "agroplastic.cl" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "172.20.10.5" },
    ],
  },

  webpack: (config, { isServer }) => {
    // ✅ Alias al worker local
    config.resolve.alias["pdfjs-dist/build/pdf.worker.min.js"] = path.resolve(
      __dirname,
      "node_modules/pdfjs-dist/build/pdf.worker.min.js"
    );

    // ✅ Evitar requerir 'canvas' en el servidor
    if (isServer) {
      config.externals.push({ canvas: "canvas" });
    }

    return config;
  },
};

export default nextConfig;

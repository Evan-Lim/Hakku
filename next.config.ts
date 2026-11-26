import type { NextConfig } from "next";

const isStaticExport = process.env.HAKKU_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
    : {}),
};

export default nextConfig;

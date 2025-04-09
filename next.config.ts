import type { NextConfig } from "next";
const isExport = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  basePath: isExport ? "/cardsOfProducts" : "",
  assetPrefix: isExport ? "/cardsOfProducts/" : "",
  images: {
    domains: ["cdn2.thecatapi.com", "cdn1.thecatapi.com"],
    formats: ["image/webp"],
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;

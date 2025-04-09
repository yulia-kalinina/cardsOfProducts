import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/cardsOfProducts" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/cardsOfProducts/" : "",
  images: {
    domains: ["cdn2.thecatapi.com", "cdn1.thecatapi.com"],
    formats: ["image/webp"],
    unoptimized: true,
  },
};

export default nextConfig;

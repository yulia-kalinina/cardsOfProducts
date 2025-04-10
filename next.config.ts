import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: process.env.NODE_ENV === "production" ? "/cardsOfProducts" : "",
  images: {
    domains: ["cdn2.thecatapi.com", "cdn1.thecatapi.com"],
    formats: ["image/webp"],
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cardsOfProducts",
  images: {
    domains: ["cdn2.thecatapi.com", "cdn1.thecatapi.com"],
    formats: ["image/webp"],
    unoptimized: true,
  },
  trailingSlash: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;

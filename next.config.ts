import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn2.thecatapi.com", "cdn1.thecatapi.com"],
    formats: ['image/webp']
  },
};

export default nextConfig;

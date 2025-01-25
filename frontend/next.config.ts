import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_API_URL!.startsWith("https") ? "https" : "http",
        hostname: process.env.NEXT_PUBLIC_API_URL!.split("://")[1].split(":")[0], // Extract hostname
        port: process.env.NEXT_PUBLIC_API_URL!.split(":")[2] || undefined, // Extract port if exists
        pathname: "/uploads/**", // Match the uploads path
      },
    ],
  },
};

export default nextConfig;

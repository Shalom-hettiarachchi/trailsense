import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* Explicitly transpile packages that often have ESM/CJS resolution 
      issues in the Next.js 16 + Turbopack environment.
  */
  transpilePackages: [
    "react-resizable-panels",
    "lucide-react",
    "recharts"
  ],

  // Add the images configuration here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // Optional: If you run into issues with Turbopack, you can add 
  // specific experimental flags here, but the above is usually enough.
  experimental: {
    // serverComponentsExternalPackages: ["mongoose", "mongodb"],
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['firebase-admin', 'firebase-functions'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'sonner',
      'zustand',
      'clsx',
      'tailwind-merge'
    ],
  },
};

export default nextConfig;

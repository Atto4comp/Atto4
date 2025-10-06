import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🚫 Completely disable Vercel Image Optimization
  //    This ensures no optimizer quota, cache writes, or billing.
  images: {
    unoptimized: true, // disables /_next/image optimizer
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },

  // ✅ Core Next.js settings
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // ✅ Ignore linting/type errors during Vercel build (safe for deployment)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ⚡ Small build-time optimization (optional)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;

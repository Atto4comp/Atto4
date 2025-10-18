import type { NextConfig } from 'next';

const MOVIE_TPL =
  process.env.NEXT_PUBLIC_MOVIE_EMBED_1
  ?? 'https://iframe.pstream.mov/embed/tmdb-movie-:id?logo=false&tips=false&theme=default&allinone=true&&backlink=https://atto4.pro/';

const TV_TPL =
  process.env.NEXT_PUBLIC_TV_EMBED_1
  ?? 'https://iframe.pstream.mov/embed/tmdb-tv-:id/:season/:episode?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org', port: '', pathname: '/t/p/**' }],
    formats: ['image/webp', 'image/avif'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: { optimizePackageImports: ['lucide-react'] },

  // 👇 NEW: proxy-friendly, external rewrites (no API handlers needed)
  async rewrites() {
    return [
      // Movie: /embed/movie/123  ->  3P URL with :id substituted
      {
        source: '/embed/movie/:id',
        destination: MOVIE_TPL, // `:id` from source auto-substitutes here
      },
      // TV: /embed/tv/123/1/5  ->  3P URL with :id/:season/:episode substituted
      {
        source: '/embed/tv/:id/:season/:episode',
        destination: TV_TPL, // `:id`, `:season`, `:episode` auto-substitute
      },
    ];
  },

  // (optional) security headers — keep if you like
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;

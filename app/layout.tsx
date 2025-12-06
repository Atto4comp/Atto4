// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ActivitySidebar from '@/components/layout/ActivitySidebar'; // ✅ Added
import { SITE_CONFIG } from '@/lib/constants';
import { Analytics } from "@vercel/analytics/next";

// ✅ Optimize font loading with display swap
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// ✅ Static metadata for SSG
export const metadata: Metadata = {
  title: {
    default: 'Atto4 - Stream Movies & TV Shows Online',
    template: `%s | Atto4`,
  },
  description: SITE_CONFIG.description || 'Stream the latest movies and TV shows online. Watch thousands of titles in HD quality.',
  keywords: ['streaming', 'movies', 'tv shows', 'entertainment', 'watch online', 'HD streaming', 'Atto4'],
  authors: [
    {
      name: 'Atto4',
      url: SITE_CONFIG.url,
    },
  ],
  creator: 'Atto4',
  publisher: 'Atto4',
  metadataBase: new URL(SITE_CONFIG.url || 'https://atto4.pro'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: 'Atto4 - Stream Movies & TV Shows Online',
    description: SITE_CONFIG.description,
    siteName: 'Atto4',
    images: [
      {
        url: SITE_CONFIG.ogImage || '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Atto4 - Stream Movies & TV Shows',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@Atto4',
    creator: '@Atto4',
    title: 'Atto4 - Stream Movies & TV Shows Online',
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage || '/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  category: 'entertainment',
};

// ✅ Root layout with SSG optimizations
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* ✅ Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        
        {/* ✅ Theme color for mobile browsers */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="dark" />
        
        {/* ✅ Prevent zoom on iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body 
        className="min-h-screen bg-black text-white antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Header */}
        <Header />
        
        {/* Main Content with proper spacing */}
        <main className="pt-16 md:pt-20 min-h-screen relative">
          {children}
        </main>

        {/* ✅ Activity Sidebar (Floating) */}
        <ActivitySidebar />
        
        {/* Footer */}
        <Footer />
        
        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}

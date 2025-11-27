// app/login/page.tsx

import { Suspense } from 'react';
import LoginPageClient from '@/components/pages/LoginPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ✅ Configure as static page
export const dynamic = 'force-static';
export const revalidate = false; // Login page doesn't need revalidation

// ✅ Generate Metadata
export const metadata = {
  title: 'Sign In - Access Your Account | Atto4',
  description: 'Sign in to your Atto4 account to access thousands of movies and TV shows. Stream your favorite content in HD quality.',
  keywords: ['login', 'sign in', 'account', 'streaming', 'Atto4'],
  openGraph: {
    title: 'Sign In | Atto4',
    description: 'Welcome back to your streaming world',
    type: 'website',
    url: 'https://atto4.pro/login',
  },
  robots: {
    index: false, // Don't index login pages
    follow: true,
  },
};

// ✅ Main Login Page (Server Component)
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPageClient />
      </Suspense>
    </div>
  );
}

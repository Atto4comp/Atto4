// components/pages/LoginPageClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPageClient() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Form validation
  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return false;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };

  // ✅ Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call (replace with actual authentication)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual authentication logic
      console.log('Login attempt:', { email, password: '***' });
      
      // On success, redirect to home
      router.push('/');
      
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-3 group"
            aria-label="Go to homepage"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-white/10 p-1 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-lg overflow-hidden relative">
                <Image 
                  src="/logo.png" 
                  alt="Atto4 Logo" 
                  fill 
                  className="object-cover" 
                  priority 
                  sizes="48px"
                />
              </div>
            </div>
            <span className="font-chillax text-2xl font-bold text-white tracking-wide">
              Atto4
            </span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">
            Welcome back to your streaming world
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Sign in to your account
          </h1>

          {/* Error Message */}
          {error && (
            <div 
              className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700/50 focus:ring-offset-0 focus:ring-2 cursor-pointer" 
                />
                <span className="ml-2 text-sm text-gray-400">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-xl py-3 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* Glass base */}
              <div className="absolute inset-0 bg-black/40 border border-white/10 rounded-xl" />

              {/* Gradient glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/40 via-purple-600/35 to-blue-600/40 opacity-90 blur-md transform transition-all duration-300 group-hover:scale-105 group-disabled:scale-100" />

              {/* Highlight overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />

              <span className="relative z-10 flex items-center justify-center gap-2 text-white font-semibold">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900/80 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Options (Optional) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/50 border border-white/10 rounded-lg text-white hover:bg-gray-800 transition-colors"
              onClick={() => console.log('Google login')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm">Google</span>
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/50 border border-white/10 rounded-lg text-white hover:bg-gray-800 transition-colors"
              onClick={() => console.log('Apple login')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="text-sm">Apple</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create one now
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p className="mb-2">By signing in, you agree to our</p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              href="/terms" 
              className="hover:text-gray-400 transition-colors"
            >
              Terms of Service
            </Link>
            <span className="text-gray-600">•</span>
            <Link 
              href="/privacy" 
              className="hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

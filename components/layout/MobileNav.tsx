'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/hooks/useAuth';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV', icon: Tv },
  { href: '/search', label: 'Search', icon: Search },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setIsAuthModalOpen(false);
  }, [pathname]);

  const profileHref = user ? '/profile' : null;

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-[440px] items-center justify-around rounded-[22px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,10,14,0.96),rgba(5,5,7,0.99))] px-1 py-1.5 shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
          {NAV_ITEMS.map((item) => {
            const isSearch = item.href === '/search';
            const isActive = isSearch
              ? pathname.startsWith('/search')
              : pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 active:scale-95 transition-transform"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.07]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      'relative z-10 h-[18px] w-[18px] transition-colors duration-200',
                      isActive ? 'text-white' : 'text-white/35'
                    )}
                  />

                </div>
                <span
                  className={cn(
                    'text-[9px] font-medium tracking-wide transition-colors duration-200',
                    isActive ? 'text-white' : 'text-white/30'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Profile / Sign-in tab */}
          {profileHref ? (
            <Link
              href={profileHref}
              className="flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 active:scale-95 transition-transform"
            >
              <div className="relative flex h-8 w-8 items-center justify-center">
                {pathname === '/profile' && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.07]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <User
                  className={cn(
                    'relative z-10 h-[18px] w-[18px] transition-colors duration-200',
                    pathname === '/profile' ? 'text-white' : 'text-white/35'
                  )}
                />

              </div>
              <span
                className={cn(
                  'text-[9px] font-medium tracking-wide transition-colors duration-200',
                  pathname === '/profile' ? 'text-white' : 'text-white/30'
                )}
              >
                Me
              </span>
            </Link>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 active:scale-95 transition-transform"
            >
              <div className="relative flex h-8 w-8 items-center justify-center">
                <User className="relative z-10 h-[18px] w-[18px] text-white/35 transition-colors duration-200" />
              </div>
              <span className="text-[9px] font-medium tracking-wide text-white/30">
                Sign In
              </span>
            </button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

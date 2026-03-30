'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV', icon: Tv },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-[320px] items-center justify-between rounded-full border border-white/[0.05] bg-[rgba(8,8,12,0.92)] px-3 py-2 shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center justify-center rounded-full p-2.5 transition-all duration-200 active:scale-90',
                isActive && 'bg-white/[0.08]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-full bg-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={cn(
                  'relative z-10 h-[19px] w-[19px] transition-colors duration-200',
                  isActive ? 'text-white' : 'text-white/30'
                )}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

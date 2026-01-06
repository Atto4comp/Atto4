'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent
} from 'framer-motion';
import {
  Search, Menu, Home, Film, Tv, Grid3X3, X, History,
  Bell, BookOpen, AlertCircle, PlayCircle, RefreshCw,
  Captions, ChevronRight, Zap, Sparkles
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV Shows', icon: Tv },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Welcome to Atto4',
    desc: 'The next-gen streaming platform. Ad-free, high-speed, and fully customizable.',
    date: 'Now',
    type: 'info'
  },
  {
    id: 2,
    title: 'Version v1.0.2 (Beta)',
    desc: 'Current stable build. Includes new player controls and glassmorphic UI.',
    date: 'Dec 15',
    type: 'version'
  },
  {
    id: 3,
    title: 'New Feature: Home Button',
    desc: 'Added a dedicated Home button inside the player for easier navigation from embeds.',
    date: 'Dec 14',
    type: 'feature'
  },
];

const NavItem = ({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) => (
  <Link href={item.href} className="relative px-4 py-2 rounded-full group">
    {isActive && (
      <motion.div
        layoutId="nav-pill"
        className="absolute inset-0 bg-white/10 rounded-full"
        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span
      className={cn(
        'relative z-10 flex items-center gap-2 text-sm font-medium transition-colors duration-200',
        isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
      )}
    >
      <span
        className={cn(
          'transition-all duration-300',
          isActive
            ? 'opacity-100 w-auto'
            : 'opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100'
        )}
      >
        <item.icon size={14} />
      </span>
      {item.label}
    </span>
  </Link>
);

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates');
  const [scrolled, setScrolled] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const router = useRouter();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 20;
    if (next !== scrolled) setScrolled(next);
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsInfoPanelOpen(false);
  }, [pathname]);

  const toggleActivity = () =>
    window.dispatchEvent(new CustomEvent('toggle-activity-view'));

  return (
    <>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        {/* Capsule */}
        <motion.div
          className="pointer-events-auto relative mt-4 flex items-center justify-between bg-[#050505]/85 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50"
          initial={{ borderRadius: 32, width: 'auto' }}
          animate={{
            padding: scrolled ? '8px 12px' : '10px 20px',
            y: scrolled ? -6 : 0,
            borderRadius: 32,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="relative z-10 flex items-center justify-between w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center pl-2 pr-6 group">
              <div className="relative w-7 h-7 mr-2.5">
                <Image src="/logo.png" alt="Atto4" width={28} height={28} priority />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white">Atto4</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-[0.25em] uppercase">
                  Stream
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center mr-4">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10"
              >
                <Search size={18} />
              </button>

              <button
                onClick={toggleActivity}
                className="p-2.5 rounded-full text-white/60 hover:text-blue-400 hover:bg-blue-500/10"
              >
                <History size={18} />
              </button>

              <button
                ref={notifButtonRef}
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                className="p-2.5 rounded-full text-white/60 hover:bg-white/10 relative"
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#050505]" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 text-white/70 hover:text-white"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />

            {/* ✅ FIXED POSITION */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl z-[101] pointer-events-auto"
            >
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl">
                <SearchBar onClose={() => setIsSearchOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

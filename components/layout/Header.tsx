'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search, Menu, Home, Film, Tv, Grid3X3, X,
  History, Bell, BookOpen, AlertCircle,
  PlayCircle, RefreshCw, Captions
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

const navigationItems = [
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
    type: 'info',
  },
  {
    id: 2,
    title: 'Version v1.0.2 (Beta)',
    desc: 'Current stable build. Includes new player controls and glassmorphic UI.',
    date: 'Dec 15',
    type: 'version',
  },
  {
    id: 3,
    title: 'New Feature: Home Button',
    desc: 'Added a dedicated Home button inside the player for easier navigation from embeds.',
    date: 'Dec 14',
    type: 'feature',
  },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates');
  const [scrolled, setScrolled] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  /* ───────────────── Scroll detection ───────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ───────────────── Click outside info panel ───────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsInfoPanelOpen(false);
      }
    };
    if (isInfoPanelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isInfoPanelOpen]);

  /* ───────────────── Route change cleanup ───────────────── */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsInfoPanelOpen(false);
  }, [pathname]);

  const toggleActivity = () => {
    window.dispatchEvent(new CustomEvent('toggle-activity-view'));
  };

  return (
    <>
      {/* ✅ FIXED HEADER (NO BLUR BLEED) */}
      <header
        className={`fixed top-0 inset-x-0 z-50 overflow-hidden transition-all duration-300 ${
          scrolled
            ? 'bg-[#050505]/70 backdrop-blur-xl border-b border-white/10'
            : 'bg-transparent backdrop-blur-0'
        }`}
      >
        <div className="relative max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <Image src="/logo.png" alt="Atto4" width={22} height={22} />
            </div>
            <div className="leading-tight">
              <span className="block text-white font-chillax text-lg">Atto4</span>
              <span className="block text-[10px] tracking-widest text-gray-400">STREAM</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigationItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${
                    active
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="action-orb">
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <button onClick={toggleActivity} className="action-orb">
              <History size={18} />
            </button>

            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                className="action-orb"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {isInfoPanelOpen && (
                <div className="absolute right-0 mt-4 w-[380px] bg-[#050505]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50">
                  {/* Panel content unchanged */}
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/donate')}
              className="hidden sm:flex px-4 py-2 rounded-full bg-yellow-400/20 text-yellow-300 hover:bg-yellow-400/30"
            >
              Donate
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden action-orb"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <div
        className={`search-curtain ${isSearchOpen ? 'open' : ''}`}
        onClick={() => setIsSearchOpen(false)}
      />

      <div className={`search-capsule-wrapper ${isSearchOpen ? 'open' : ''}`}>
        {isSearchOpen && (
          <div className="bg-[#050505] border border-white/10 rounded-3xl p-2 shadow-2xl">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-sheet ${isMobileMenuOpen ? 'open' : ''}`} style={{ background: '#050505' }}>
        {/* unchanged */}
      </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, User, Home, Film, Tv, Grid3X3, X } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV Shows', icon: Tv },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 90);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-450 ${
          scrolled ? 'header-visible' : 'header-invisible'
        }`}
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - UNCHANGED */}
            <Link href="/" className="logo-ghost group" aria-label="Home">
              <div className="logo-icon">
                <div className="logo-background" />
                <Image src="/logo.png" alt="Atto4 Logo" fill className="object-cover" priority />
              </div>
              <div className="logo-content">
                <span className="logo-name font-chillax">Atto4</span>
                <span className="logo-tagline">Stream. Discover.</span>
              </div>
            </Link>

            {/* Desktop Nav - UNCHANGED */}
            <nav className="nav-phantom hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className="nav-ghost-link">
                    <div className={`nav-phantom-item ${isActive ? 'phantom-active' : 'phantom-inactive'}`}>
                      <Icon className="phantom-icon" />
                      <span className="phantom-text font-chillax">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Actions - UNCHANGED */}
            <div className="actions-ghost flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen((s) => !s)}
                className={`ghost-action ${isSearchOpen ? 'ghost-active' : 'ghost-inactive'}`}
                aria-pressed={isSearchOpen}
                aria-label="Toggle search"
              >
                <Search className="ghost-icon" />
              </button>

              <button
                onClick={() => router.push('/login')}
                className="ghost-action ghost-inactive"
                aria-label="Login"
              >
                <User className="ghost-icon" />
              </button>

              <button
                onClick={() => setIsMobileMenuOpen((s) => !s)}
                className={`ghost-action md:hidden ${isMobileMenuOpen ? 'ghost-active ghost-rotate' : 'ghost-inactive'}`}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="ghost-icon" /> : <Menu className="ghost-icon" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search - UNCHANGED */}
      <div className={`search-phantom ${isSearchOpen ? 'search-visible' : 'search-hidden'}`}>
        <div className="search-wrapper">
          <div className="search-glass">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </div>
{/* MINIMALISTIC TOP DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <>
          {/* Subtle Backdrop */}
          <div
            className="mobile-backdrop-minimal md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Compact Top Menu */}
          <div className="mobile-top-menu fixed top-16 left-4 right-4 z-40 glass-strong rounded-2xl shadow-2xl md:hidden">
            <div className="p-4">
              
              {/* Minimal Close Button */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="close-btn-minimal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Compact Navigation - CHILLAX FONT */}
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-menu-item glass-card flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'text-blue-400 bg-blue-500/20 border border-blue-400/30' 
                          : 'text-white hover:text-blue-300 hover:bg-white/5'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      {/* Mobile nav items keep uppercase */}
                      <span className="font-chillax uppercase text-xs font-semibold tracking-wide">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                {/* Compact Login - CHILLAX FONT */}
                <button
                  onClick={() => {
                    router.push('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="mobile-menu-item glass-card flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-white hover:text-blue-300 hover:bg-white/5 transition-all duration-200 w-full"
                >
                  <User className="w-4 h-4" />
                  {/* Mobile login keeps uppercase */}
                  <span className="font-chillax uppercase text-xs font-semibold tracking-wide">
                    Login
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


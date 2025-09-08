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

  // Prevent page scroll when menu open (mobile)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
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
            {/* Logo */}
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

            {/* Desktop Nav */}
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

            {/* Actions */}
            <div className="actions-ghost flex items-center gap-2">
              {/* Search (smaller button) */}
              <button
                onClick={() => setIsSearchOpen((s) => !s)}
                className={`ghost-action ${isSearchOpen ? 'ghost-active' : 'ghost-inactive'}`}
                aria-pressed={isSearchOpen}
                aria-label="Toggle search"
              >
                <Search className="ghost-icon" />
              </button>

              {/* Login */}
              <button
                onClick={() => router.push('/login')}
                className="ghost-action ghost-inactive"
                aria-label="Login"
              >
                <User className="ghost-icon" />
              </button>

              {/* Mobile toggle */}
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

      {/* Compact Search */}
      <div className={`search-phantom ${isSearchOpen ? 'search-visible' : 'search-hidden'}`}>
        <div className="search-wrapper">
          <div className="search-glass">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </div>

      {/* Mobile menu — slides down from nav (glass panel attached under header) */}
      {/* NOTE: we always render the container so CSS transition works; the panel transforms between -100% -> 0 */}
      <div className="md:hidden" aria-hidden={!isMobileMenuOpen}>
        <div
          className="mobile-phantom"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          {/* backdrop (starts below header) */}
          <div
            className={`mobile-backdrop-ghost ${isMobileMenuOpen ? 'mobile-backdrop-visible' : 'mobile-backdrop-hidden'}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* glass panel slides down from the top (under header) */}
          <div
            className="mobile-menu-ghost"
            style={{
              transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
              transition: 'transform 300ms cubic-bezier(0.2,0.8,0.2,1)',
            }}
            aria-hidden={!isMobileMenuOpen}
          >
            <div className="mobile-header-ghost">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Atto4" width={32} height={32} className="rounded-sm" />
                <div>
                  <div className="font-chillax font-semibold">Atto4</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen((s) => !s);
                  }}
                  className="ghost-action"
                  aria-label="Open search"
                >
                  <Search className="ghost-icon" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/login');
                  }}
                  className="ghost-action"
                  aria-label="Login"
                >
                  <User className="ghost-icon" />
                </button>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-close-ghost"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <nav className="mobile-nav-ghost">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-item-ghost flex items-center gap-3 ${isActive ? 'mobile-active' : 'mobile-inactive'}`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-chillax mobile-text-ghost">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mobile-footer-ghost">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/watch');
                }}
                className="mobile-cta-ghost"
              >
                Play
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/discover');
                }}
                className="mobile-cta-ghost secondary"
              >
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


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

      {/* Compact Search - UNCHANGED */}
      <div className={`search-phantom ${isSearchOpen ? 'search-visible' : 'search-hidden'}`}>
        <div className="search-wrapper">
          <div className="search-glass">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </div>

      {/* ✅ NEW Modern Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-modern-overlay" role="dialog" aria-modal="true">
          <div className="mobile-modern-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="mobile-modern-container">
            {/* Header Section */}
            <div className="mobile-modern-header">
              <div className="mobile-modern-brand">
                <div className="mobile-modern-logo">
                  <Image src="/logo.png" alt="Atto4 Logo" width={24} height={24} className="object-contain" />
                </div>
                <div>
                  <h2 className="mobile-modern-title font-chillax">Atto4</h2>
                  <p className="mobile-modern-subtitle">Stream. Discover.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="mobile-modern-close"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="mobile-modern-nav">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-modern-item ${isActive ? 'mobile-modern-active' : 'mobile-modern-inactive'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`mobile-modern-icon-wrapper ${isActive ? 'mobile-modern-icon-active' : 'mobile-modern-icon-inactive'}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="mobile-modern-label font-chillax">{item.label}</span>
                    {isActive && <div className="mobile-modern-indicator" />}
                  </Link>
                );
              })}
            </div>

            {/* Footer Action */}
            <div className="mobile-modern-footer">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="mobile-modern-login"
              >
                <User className="w-5 h-5" />
                <span className="font-chillax">Sign In</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


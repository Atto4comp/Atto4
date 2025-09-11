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
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Soft Glass Header */}
      <header className={`soft-glass-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          
          {/* Soft Glass Logo Section */}
          <Link href="/" className="logo-section">
            <div className="logo-wrapper-soft">
              <div className="logo-icon-soft">
                <Image 
                  src="/logo.png" 
                  alt="Atto4 Logo" 
                  width={28} 
                  height={28} 
                  className="logo-image"
                />
              </div>
            </div>
            <div className="brand-text">
              <span className="brand-name-soft font-chillax">Atto4</span>
              <span className="brand-tagline-soft">Stream. Discover.</span>
            </div>
          </Link>

          {/* Desktop Navigation - Soft Glass Cards */}
          <nav className="desktop-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`nav-soft-glass ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-text font-chillax">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`action-button-soft ${isSearchOpen ? 'active' : ''}`}
              aria-label="Toggle search"
              aria-expanded={isSearchOpen}
            >
              <Search className="action-icon" />
            </button>

            <button
              onClick={() => router.push('/login')}
              className="action-button-soft"
              aria-label="Login"
            >
              <User className="action-icon" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`action-button-soft mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="action-icon" />
              ) : (
                <Menu className="action-icon" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Soft Glass Search Overlay */}
      <div className={`search-overlay-soft ${isSearchOpen ? 'visible' : ''}`}>
        <div className="search-container">
          <div className="search-soft-glass">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </div>

      {/* Rectangular Single Row Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay-soft" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Soft Backdrop */}
          <div 
            className="mobile-backdrop-soft" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          
          {/* Dropdown Panel - Single Row Layout */}
          <div className="mobile-dropdown-rectangular">
            
            {/* Header */}
            <div className="mobile-header-soft">
              <div className="mobile-brand-soft">
                <div className="mobile-logo-soft">
                  <Image 
                    src="/logo.png" 
                    alt="Atto4" 
                    width={24} 
                    height={24}
                    className="object-contain"
                  />
                </div>
                <div className="mobile-brand-text">
                  <h2 id="mobile-menu-title" className="font-chillax">Navigation</h2>
                  <p>Choose your destination</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-close-soft"
                aria-label="Close menu"
              >
                <X className="close-icon" />
              </button>
            </div>

            {/* Rectangular Navigation Row */}
            <div className="mobile-nav-rectangular">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-nav-item-rectangular ${isActive ? 'active' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="nav-item-icon-rectangular" />
                    <span className="nav-item-text-rectangular font-chillax">{item.label}</span>
                    {isActive && <div className="active-indicator-rectangular"></div>}
                  </Link>
                );
              })}
            </div>

            {/* Footer Actions - Login Only */}
            <div className="mobile-actions-rectangular">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="action-login-rectangular"
              >
                <User className="w-5 h-5" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


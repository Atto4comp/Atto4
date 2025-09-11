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
      {/* Modern Glass Header */}
      <header className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Enhanced Logo Section */}
          <Link href="/" className="logo-section">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <Image 
                  src="/logo.png" 
                  alt="Atto4 Logo" 
                  width={28} 
                  height={28} 
                  className="logo-image"
                />
              </div>
              <div className="logo-gradient"></div>
            </div>
            <div className="brand-text">
              <span className="brand-name font-chillax">Atto4</span>
              <span className="brand-tagline">Stream. Discover.</span>
            </div>
          </Link>

          {/* Desktop Navigation - Glass Cards */}
          <nav className="desktop-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`nav-glass-card ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-text font-chillax">{item.label}</span>
                  {isActive && <div className="nav-glow"></div>}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`action-button ${isSearchOpen ? 'active' : ''}`}
              aria-label="Toggle search"
            >
              <Search className="action-icon" />
              {isSearchOpen && <div className="button-glow"></div>}
            </button>

            <button
              onClick={() => router.push('/login')}
              className="action-button"
              aria-label="Login"
            >
              <User className="action-icon" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`action-button mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="action-icon" />
              ) : (
                <Menu className="action-icon" />
              )}
              {isMobileMenuOpen && <div className="button-glow"></div>}
            </button>
          </div>
        </div>
      </header>

      {/* Glass Search Overlay */}
      <div className={`search-overlay ${isSearchOpen ? 'visible' : ''}`}>
        <div className="search-container">
          <div className="search-glass">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </div>

      {/* Modern Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Glass Backdrop */}
          <div 
            className="mobile-backdrop" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="mobile-dropdown">
            {/* Header */}
            <div className="mobile-header">
              <div className="mobile-brand">
                <div className="mobile-logo">
                  <Image 
                    src="/logo.png" 
                    alt="Atto4" 
                    width={24} 
                    height={24}
                  />
                </div>
                <div className="mobile-brand-text">
                  <h2 id="mobile-menu-title" className="font-chillax">Navigation</h2>
                  <p>Choose your destination</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-close"
                aria-label="Close menu"
              >
                <X className="close-icon" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="mobile-nav">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`nav-item-icon ${isActive ? 'active' : ''}`}>
                      <Icon />
                    </div>
                    <span className="nav-item-text font-chillax">{item.label}</span>
                    {isActive && <div className="active-dot"></div>}
                  </Link>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="mobile-actions">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  // Add play functionality
                }}
                className="action-primary"
              >
                ▶ Play
              </button>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="action-secondary"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}




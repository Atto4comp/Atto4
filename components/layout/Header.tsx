// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, Home, Film, Tv, Grid3X3, X, Sparkles } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

// Custom Donation Jar Icon Component
const DonateJarIcon = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Jar Outline */}
    <path d="M19 10c0-3.9-3.1-7-7-7S5 6.1 5 10v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-6z" />
    <path d="M8 3h8" />
    <path d="M12 11v6" />
    {/* Dollar Symbol */}
    <path d="M12 11a2 2 0 0 1 2 2 2 2 0 1 1-4 0 2 2 0 0 1 2-2" />
    <path d="M12 17v-6" />
    <path d="M12 11a2 2 0 0 0-2-2 2 2 0 0 0 2 2" />
    <path d="M12 17a2 2 0 0 0 2-2 2 2 0 0 0-2 2" />
    
    {/* Simplified S shape inside */}
    <path d="M10 13h4" />
    <path d="M12 12v2" />
  </svg>
);

// OR better yet, using standard Lucide 'Coins' which is cleaner, 
// but I will stick to your request for a "Jar". 
// Actually, let's just use 'CircleDollarSign' as it's cleaner if the custom SVG looks weird.
// Let's try to approximate the visual:
import { CircleDollarSign } from 'lucide-react';

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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`modern-header-wrapper ${scrolled ? 'scrolled' : ''}`}>
        
        <div className="glass-capsule">
          
          {/* Brand */}
          <Link href="/" className="flex items-center group">
            <div className="logo-circle">
              <Image 
                src="/logo.png" 
                alt="Atto4" 
                width={24} 
                height={24} 
                className="object-contain"
                priority
              />
            </div>
            <div className="logo-text-wrapper">
              <span className="brand-title font-chillax">Atto4</span>
              <span className="brand-subtitle">STREAM</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="nav-island mx-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`nav-pill ${isActive ? 'active' : ''}`}
                >
                  <Icon className={`nav-icon-sm ${isActive ? 'text-black' : 'text-white'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="action-group">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="action-orb"
              aria-label="Search"
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* DONATE BUTTON (Replaced Login) */}
            <button
              onClick={() => router.push('/donate')}
              className="action-orb primary hidden sm:flex text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors border-yellow-400/20"
              aria-label="Donate"
            >
              {/* Using CircleDollarSign as a clean, standard representation of 'Money/Donate' */}
              <CircleDollarSign size={20} strokeWidth={2.5} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="action-orb sm:hidden"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Search Curtain */}
      <div 
        className={`search-curtain ${isSearchOpen ? 'open' : ''}`}
        onClick={() => setIsSearchOpen(false)}
      />
      
      <div className={`search-capsule-wrapper ${isSearchOpen ? 'open' : ''}`}>
        {isSearchOpen && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-sheet ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-6 px-2">
          <span className="text-white font-chillax text-lg">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-white/10 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mobile-grid">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`mobile-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="mobile-icon" />
                <span className="mobile-label">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          {/* Donate Button Mobile */}
          <button 
            onClick={() => router.push('/donate')}
            className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20"
          >
            <CircleDollarSign size={20} strokeWidth={2.5} />
            Donate
          </button>
        </div>
      </div>
    </>
  );
}

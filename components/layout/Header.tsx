// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, Home, Film, Tv, Grid3X3, X, History } from 'lucide-react'; // Added History icon
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // ✅ Helper to toggle the activity sidebar
  const toggleActivity = () => {
    window.dispatchEvent(new CustomEvent('toggle-activity-view'));
  };

  return (
    <>
      <header className={`modern-header-wrapper ${scrolled ? 'scrolled' : ''}`}>
        
        <div className="glass-capsule">
          
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

          <div className="action-group">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="action-orb"
              aria-label="Search"
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* ✅ NEW: Activity / History Button */}
            <button
              onClick={toggleActivity}
              className="action-orb hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
              aria-label="Activity"
              title="Continue Watching"
            >
              <History size={18} />
            </button>

            {/* Donate Orb */}
            <button
              onClick={() => router.push('/donate')}
              className="action-orb primary hidden sm:flex bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/20 transition-colors p-2"
              aria-label="Donate"
            >
              <Image 
                src="/donation.svg"
                alt="Donate" 
                width={20} 
                height={20} 
                className="w-5 h-5 object-contain"
              />
            </button>

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
          
          {/* ✅ Mobile Menu Item for Activity */}
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              toggleActivity();
            }}
            className="mobile-item"
          >
            <History className="mobile-icon" />
            <span className="mobile-label">Activity</span>
          </button>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => router.push('/donate')}
            className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20"
          >
             <Image 
                src="/donation.svg"
                alt="Donate" 
                width={24} 
                height={24} 
                className="w-6 h-6 object-contain"
              />
            Donate
          </button>
        </div>
      </div>
    </>
  );
}

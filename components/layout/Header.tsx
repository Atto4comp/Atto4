// components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, Home, Film, Tv, Grid3X3, X } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

// 🎨 Custom Donation Icon Component (from your image)
const DonateIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 512 512" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Coin */}
    <path d="M256 0C185.3 0 128 57.3 128 128H170.7C170.7 80.8 208.8 42.7 256 42.7C303.2 42.7 341.3 80.8 341.3 128H384C384 57.3 326.7 0 256 0Z" />
    <path d="M256 64C220.7 64 192 92.7 192 128H234.7C234.7 116.2 244.2 106.7 256 106.7C267.8 106.7 277.3 116.2 277.3 128H320C320 92.7 291.3 64 256 64Z" />
    {/* Dollar Sign */}
    <path d="M245.3 74.7V96C233.6 98.4 224 106.9 224 117.3C224 129.1 233.6 138.7 245.3 138.7V160C239.5 160 234.7 155.2 234.7 149.3H213.3C213.3 163.2 222.2 175.1 234.7 179.7V181.3H256V160C267.8 157.6 277.3 149.1 277.3 138.7C277.3 126.9 267.8 117.3 256 117.3V96C261.9 96 266.7 100.8 266.7 106.7H288C288 92.8 279.1 80.9 266.7 76.3V74.7H245.3ZM256 138.7C261.9 138.7 266.7 143.5 266.7 149.3C266.7 155.2 261.9 160 256 160V138.7ZM245.3 117.3C245.3 111.5 250.1 106.7 256 106.7V128C250.1 128 245.3 123.2 245.3 117.3Z" />
    {/* Box Top */}
    <path d="M64 192V256H448V192H64ZM106.7 234.7V213.3H405.3V234.7H106.7Z" />
    {/* Box Bottom with Heart */}
    <path d="M85.3 277.3V490.7H426.7V277.3H384V448H128V277.3H85.3ZM256 330.7C220.5 330.7 192 359.2 192 394.7C192 419.7 256 469.3 256 469.3C256 469.3 320 419.7 320 394.7C320 359.2 291.5 330.7 256 330.7ZM256 438.7C241.3 425.6 213.3 399.5 213.3 394.7C213.3 371.1 232.5 352 256 352C279.5 352 298.7 371.1 298.7 394.7C298.7 399.5 270.7 425.6 256 438.7Z" />
  </svg>
);

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
      {/* Floating Header Wrapper */}
      <header className={`modern-header-wrapper ${scrolled ? 'scrolled' : ''}`}>
        
        {/* Glass Capsule Island */}
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

          {/* Nav Pills (Desktop) */}
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

          {/* Action Orbs */}
          <div className="action-group">
            {/* Search Orb */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="action-orb"
              aria-label="Search"
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* DONATE ORB (Desktop) */}
            <button
              onClick={() => router.push('/donate')}
              className="action-orb primary hidden sm:flex text-yellow-400 hover:bg-yellow-400/20 hover:text-yellow-300 transition-colors border-yellow-400/20"
              aria-label="Donate"
            >
              <DonateIcon size={20} />
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

      {/* Search Overlay */}
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

      {/* Mobile Sheet */}
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
          {/* DONATE BUTTON (Mobile) */}
          <button 
            onClick={() => router.push('/donate')}
            className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20"
          >
            <DonateIcon size={24} />
            Donate
          </button>
        </div>
      </div>
    </>
  );
}

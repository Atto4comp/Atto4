'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Menu, Home, Film, Tv, Grid3X3, X, History, Bell, BookOpen, AlertCircle, PlayCircle, RefreshCw, Captions } from 'lucide-react'; 
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

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false); 
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates'); 
  
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsInfoPanelOpen(false);
      }
    };
    if (isInfoPanelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoPanelOpen]);

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
      {/* ✅ ULTRA MINIMAL HEADER: Transparent with subtle blur only on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 pointer-events-none ${scrolled ? 'bg-black/20 backdrop-blur-md' : ''}`}>
        
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between pointer-events-auto">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-7 h-7 transition-transform duration-300 group-hover:scale-110">
              <Image 
                src="/logo.png" 
                alt="Atto4" 
                width={28} 
                height={28} 
                className="object-contain"
                priority
              />
            </div>
            <span className="font-chillax font-bold text-lg text-white tracking-tight">Atto4</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'bg-white text-black shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Search"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <button
              onClick={toggleActivity}
              className="p-2 rounded-full text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
              aria-label="Activity"
              title="Continue Watching"
            >
              <History size={20} />
            </button>

            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                className={`p-2 rounded-full transition-all relative ${isInfoPanelOpen ? 'text-white bg-white/10' : 'text-gray-300 hover:text-purple-400 hover:bg-purple-500/10'}`}
                aria-label="Updates & Guide"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>

              {isInfoPanelOpen && (
                <div className="absolute top-full right-0 mt-3 w-[380px] bg-[#0a0a0a]/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  
                  <div className="flex border-b border-white/5 p-1">
                    <button onClick={() => setInfoTab('updates')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${infoTab === 'updates' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}> <Bell size={14} /> Updates </button>
                    <button onClick={() => setInfoTab('guide')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all ${infoTab === 'guide' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}> <BookOpen size={14} /> Guide </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {infoTab === 'updates' && (
                      <div className="p-2 space-y-1">
                        {NOTIFICATIONS.map((note) => (
                          <div key={note.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-default">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${note.type === 'info' ? 'bg-blue-500/20 text-blue-400' : note.type === 'version' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>{note.type}</span>
                              <span className="text-[10px] text-gray-500">{note.date}</span>
                            </div>
                            <h4 className="text-sm font-medium text-white mb-0.5 group-hover:text-blue-300 transition-colors">{note.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">{note.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {infoTab === 'guide' && (
                      <div className="p-4 space-y-5">
                        <div className="space-y-3">
                           <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><PlayCircle size={12} /> Basic Usage</h4>
                           <div className="text-xs text-gray-300 space-y-3 pl-1">
                              <p className="leading-relaxed"><span className="text-white font-medium">Getting Started:</span> Use the <Search className="inline w-3 h-3" /> Search bar to find your favorite movies or TV shows.</p>
                              <p className="leading-relaxed"><span className="text-white font-medium">History:</span> Click the <History className="inline w-3 h-3" /> button to resume where you left off.</p>
                           </div>
                        </div>

                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                           <h4 className="text-[11px] font-bold text-red-300 uppercase tracking-wider flex items-center gap-2"><AlertCircle size={12} /> Player Troubleshooting</h4>
                           <div className="text-xs text-gray-300 space-y-3">
                              <div className="flex gap-2 items-start">
                                 <RefreshCw size={12} className="mt-0.5 text-red-400 shrink-0" />
                                 <p className="leading-relaxed"><span className="text-white font-medium">Auto Fix:</span> If the video doesn't load or buffers, click "Auto Fix" or manually switch the server.</p>
                              </div>
                              <div className="flex gap-2 items-start">
                                 <Home size={12} className="mt-0.5 text-blue-400 shrink-0" />
                                 <p className="leading-relaxed">
                                    <span className="text-white font-medium">Home Button:</span> Some video servers may prevent the "Back" button from working correctly. We added a dedicated "Home" button inside the player so you can always exit safely to the main menu.
                                 </p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => router.push('/donate')} className="hidden sm:flex p-2 rounded-full bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 text-yellow-400 transition-all" aria-label="Donate">
              <Image src="/donation.svg" alt="Donate" width={18} height={18} className="w-[18px] h-[18px] object-contain" />
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="sm:hidden p-2 text-white" aria-label="Menu">
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`search-curtain ${isSearchOpen ? 'open' : ''}`} onClick={() => setIsSearchOpen(false)} />
      <div className={`search-capsule-wrapper ${isSearchOpen ? 'open' : ''}`}>{isSearchOpen && (<div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl"><SearchBar onClose={() => setIsSearchOpen(false)} /></div>)}</div>
      
      <div className={`mobile-sheet ${isMobileMenuOpen ? 'open' : ''}`} style={{ backgroundColor: '#09090b' }}>
        <div className="flex justify-between items-center mb-6 px-2"><span className="text-white font-chillax text-lg">Menu</span><button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-full"><X size={16} /></button></div>
        <div className="mobile-grid">
          {navigationItems.map((item) => { const Icon = item.icon; const isActive = pathname === item.href; return ( <Link key={item.href} href={item.href} className={`mobile-item ${isActive ? 'active' : ''}`}><Icon className="mobile-icon" /><span className="mobile-label">{item.label}</span></Link> ); })}
          <button onClick={() => { setIsMobileMenuOpen(false); toggleActivity(); }} className="mobile-item"><History className="mobile-icon" /><span className="mobile-label">Activity</span></button>
        </div>
        <div className="mt-6"><button onClick={() => router.push('/donate')} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-yellow-500/20"><Image src="/donation.svg" alt="Donate" width={24} height={24} className="w-6 h-6 object-contain" />Donate</button></div>
      </div>
    </>
  );
}

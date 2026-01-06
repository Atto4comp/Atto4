'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useMotionValueEvent 
} from 'framer-motion';
import { 
  Search, Menu, Home, Film, Tv, Grid3X3, X, History, 
  Bell, BookOpen, AlertCircle, PlayCircle, RefreshCw, Captions, ChevronRight 
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';

// --- Constants ---

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV Shows', icon: Tv },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
];

const NOTIFICATIONS = [
  { 
    id: 1, title: 'Welcome to Atto4', 
    desc: 'The next-gen streaming platform. Ad-free, high-speed, and fully customizable.', 
    date: 'Now', type: 'info' 
  },
  { 
    id: 2, title: 'Version v1.0.2 (Beta)', 
    desc: 'Current stable build. Includes new player controls and glassmorphic UI.', 
    date: 'Dec 15', type: 'version' 
  },
  { 
    id: 3, title: 'New Feature: Home Button', 
    desc: 'Added a dedicated Home button inside the player for easier navigation.', 
    date: 'Dec 14', type: 'feature' 
  },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false); 
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates'); 
  const [scrolled, setScrolled] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();

  // Optimized Scroll Logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrolled = latest > 20;
    if (isScrolled !== scrolled) setScrolled(isScrolled);
  });

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close Info Panel
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsInfoPanelOpen(false);
      }
      // Close Mobile Menu (if clicking outside the menu but not on the toggle button)
      if (isMobileMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="Menu"]')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isInfoPanelOpen || isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoPanelOpen, isMobileMenuOpen]);

  // Route Change Cleanup
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
      {/* --- Main Header Wrapper --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.div 
          className="pointer-events-auto relative mt-4 flex items-center justify-between bg-[#050505]/85 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50"
          initial={{ borderRadius: 32, width: "auto" }}
          animate={{ 
            padding: scrolled ? "8px 12px" : "10px 20px",
            y: scrolled ? -6 : 0,
            borderRadius: 32
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center group mr-4 sm:mr-6 pl-2">
            <div className="relative w-7 h-7 mr-2.5 transition-transform duration-300 group-hover:scale-110">
              <Image src="/logo.png" alt="Atto4" width={28} height={28} className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="font-chillax font-bold text-lg text-white tracking-tight leading-none">Atto4</span>
              <span className="text-[9px] text-gray-400 font-bold tracking-[0.25em] uppercase leading-none mt-0.5 group-hover:text-blue-400 transition-colors">Stream</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center bg-white/5 rounded-full px-1.5 py-1.5 mr-4 border border-white/5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${isActive ? 'text-black bg-white shadow-lg shadow-white/10 scale-105' : 'text-gray-400 hover:text-white hover:bg-white/10'}
                  `}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              {isSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <button
              onClick={toggleActivity}
              className="p-2.5 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              aria-label="Activity"
            >
              <History size={20} />
            </button>

            {/* Updates / Guide Panel */}
            <div className="relative" ref={panelRef}>
              <button
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                className={`p-2.5 rounded-full transition-colors relative ${isInfoPanelOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-purple-400 hover:bg-purple-500/10'}`}
              >
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#050505]" />
              </button>

              <AnimatePresence>
                {isInfoPanelOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{ type: "spring", duration: 0.3 }}
                    className="absolute top-full right-0 mt-3 w-[360px] sm:w-[380px] bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-white/5 p-1.5">
                      {['updates', 'guide'].map((tab) => (
                        <button 
                          key={tab}
                          onClick={() => setInfoTab(tab as any)} 
                          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all ${infoTab === tab ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        > 
                          {tab === 'updates' ? <Bell size={14} /> : <BookOpen size={14} />} 
                          {tab} 
                        </button>
                      ))}
                    </div>

                    {/* Panel Content */}
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                      {infoTab === 'updates' ? (
                        <div className="space-y-1 p-1">
                          {NOTIFICATIONS.map((note) => (
                            <div key={note.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors group">
                              <div className="flex justify-between items-start mb-1.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${note.type === 'info' ? 'bg-blue-500/10 text-blue-400' : note.type === 'version' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}`}>{note.type}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{note.date}</span>
                              </div>
                              <h4 className="text-sm font-medium text-white mb-1 group-hover:text-blue-300 transition-colors">{note.title}</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">{note.desc}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 space-y-5">
                          <div className="space-y-3">
                             <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><PlayCircle size={12} /> Basic Usage</h4>
                             <div className="text-xs text-gray-300 space-y-2 pl-3 border-l border-white/10">
                                <p><span className="text-white font-medium">Getting Started:</span> Use <Search className="inline w-3 h-3" /> to search.</p>
                                <p><span className="text-white font-medium">History:</span> Use <History className="inline w-3 h-3" /> to resume.</p>
                             </div>
                          </div>
                          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl space-y-3">
                             <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2"><AlertCircle size={12} /> Troubleshooting</h4>
                             <div className="text-xs text-gray-400 space-y-3">
                                <div className="flex gap-2.5 items-start">
                                   <RefreshCw size={14} className="mt-0.5 text-red-400 shrink-0" />
                                   <p className="leading-relaxed"><span className="text-white font-medium">Auto Fix:</span> Use if video buffers.</p>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                   <Home size={14} className="mt-0.5 text-blue-400 shrink-0" />
                                   <p className="leading-relaxed"><span className="text-white font-medium">Home Button:</span> Safe exit from embeds.</p>
                                </div>
                                <div className="flex gap-2.5 items-start">
                                   <Captions size={14} className="mt-0.5 text-yellow-400 shrink-0" />
                                   <p className="leading-relaxed"><span className="text-white font-medium">Vidly Subtitles:</span> Use <span className="underline decoration-yellow-400/50">External</span> (👂) subs.</p>
                                </div>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Donate (Desktop) */}
            <button 
              onClick={() => router.push('/donate')} 
              className="hidden sm:flex ml-2 p-2 rounded-full bg-yellow-400/5 hover:bg-yellow-400/10 border border-yellow-400/10 text-yellow-400 transition-all hover:scale-105" 
            >
              <Image src="/donation.svg" alt="Donate" width={20} height={20} className="w-5 h-5 object-contain" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="sm:hidden p-2.5 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>

        {/* --- Mobile Menu Floating Sheet (Not Full Screen) --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="pointer-events-auto absolute top-20 left-4 right-4 z-40 bg-[#050505]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto"
            >
              <div className="p-4 space-y-3">
                {/* Menu Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {NAV_ITEMS.map((item) => { 
                    const isActive = pathname === item.href; 
                    return ( 
                      <Link 
                        key={item.href} 
                        href={item.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-200
                          ${isActive 
                            ? 'bg-white text-black border-white shadow-lg' 
                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                          }
                        `}
                      >
                        <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                        <span className="text-xs font-medium">{item.label}</span>
                      </Link> 
                    ); 
                  })}
                </div>
                
                {/* Activity Row */}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); toggleActivity(); }} 
                  className="w-full flex items-center justify-between px-5 py-4 bg-white/5 rounded-2xl border border-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-full">
                      <History size={16} />
                    </div>
                    <span className="text-sm font-medium text-white">Activity</span>
                  </div>
                  <ChevronRight size={16} className="opacity-50" />
                </button>

                {/* Donate Row */}
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); router.push('/donate'); }} 
                  className="w-full py-3.5 bg-[#F59E0B] text-black rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Image src="/donation.svg" alt="Donate" width={18} height={18} />
                  Donate
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- Search Curtain (Preserved) --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 pointer-events-auto"
            >
              <div className="bg-[#050505] border border-white/10 rounded-3xl p-2 shadow-2xl ring-1 ring-white/5">
                <SearchBar onClose={() => setIsSearchOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bell, BookOpen, AlertCircle, PlayCircle, RefreshCw, Captions, ChevronRight, Zap, Sparkles 
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
const NAV_ITEMS = [
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

// --- Sub-Components ---

// 1. Magnetic Nav Item (Desktop)
const NavItem = ({ item, isActive }: { item: typeof NAV_ITEMS[0]; isActive: boolean }) => (
  <Link href={item.href} className="relative px-4 py-2 rounded-full group">
    {isActive && (
      <motion.div
        layoutId="nav-pill"
        className="absolute inset-0 bg-white/10 rounded-full"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className={cn(
      "relative z-10 flex items-center gap-2 text-sm font-medium transition-colors duration-200",
      isActive ? "text-white" : "text-white/60 group-hover:text-white"
    )}>
      <span className={cn("transition-all duration-300", isActive ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100")}>
         <item.icon size={14} />
      </span>
      {item.label}
    </span>
  </Link>
);

// --- Main Header ---

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false); 
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates'); 
  const [scrolled, setScrolled] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null); // Ref for positioning
  const menuRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const router = useRouter();
  const pathname = usePathname();

  // Optimized Scroll Physics
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrolled = latest > 20;
    if (isScrolled !== scrolled) setScrolled(isScrolled);
  });

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close Info Panel if clicking outside panel AND not on the toggle button
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(event.target as Node)
      ) {
        setIsInfoPanelOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="Menu"]')) setIsMobileMenuOpen(false);
      }
    };
    if (isInfoPanelOpen || isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoPanelOpen, isMobileMenuOpen]);

  // Cleanup on Route Change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsInfoPanelOpen(false);
  }, [pathname]);

  const toggleActivity = () => window.dispatchEvent(new CustomEvent('toggle-activity-view'));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        
        {/* --- The Capsule --- */}
        <motion.div
          className="pointer-events-auto relative mt-4 flex items-center justify-between bg-[#050505]/85 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50"
          initial={{ borderRadius: 32, width: "auto" }}
          animate={{ 
            padding: scrolled ? "8px 12px" : "10px 20px",
            y: scrolled ? -6 : 0,
            borderRadius: 32
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay rounded-[32px] overflow-hidden" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          <div className="relative z-10 flex items-center justify-between w-full">
            
            {/* Logo */}
            <Link href="/" className="flex items-center pl-2 pr-6 group">
              <div className="relative w-7 h-7 mr-2.5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                <Image src="/logo.png" alt="Atto4" width={28} height={28} className="object-contain" priority />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-white tracking-tight leading-none">Atto4</span>
                <span className="text-[9px] text-gray-500 font-bold tracking-[0.25em] uppercase leading-none mt-0.5 group-hover:text-blue-400 transition-colors">Stream</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center mr-4">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.href} item={item} isActive={pathname === item.href} />
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search size={18} />
              </button>

              <button
                onClick={toggleActivity}
                className="p-2.5 rounded-full text-white/60 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <History size={18} />
              </button>

              {/* Notification Button (Ref for positioning) */}
              <button
                ref={notifButtonRef}
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
                className={cn(
                  "p-2.5 rounded-full transition-colors relative",
                  isInfoPanelOpen ? "text-white bg-white/10" : "text-white/60 hover:text-purple-400 hover:bg-purple-500/10"
                )}
              >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#050505]" />
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="md:hidden p-2.5 text-white/70 hover:text-white"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              <button 
                onClick={() => router.push('/donate')}
                className="hidden sm:flex items-center justify-center w-8 h-8 ml-2 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-transform"
              >
                <Image src="/donation.svg" width={14} height={14} alt="Donate" className="invert-0" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* --- Notification Panel (Detached from Capsule to fix Z-Index) --- */}
        <AnimatePresence>
          {isInfoPanelOpen && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="pointer-events-auto absolute top-20 right-4 md:right-auto md:left-1/2 md:translate-x-[180px] w-[360px] sm:w-[380px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
              style={{ 
                  // Fallback positioning if exact centering isn't desired
                  // Ideally, you might want to calculate position based on notifButtonRef
                  // But centering it relative to viewport/header is safer for fixed header
              }}
            >
              <div className="flex border-b border-white/5 p-1.5">
                {(['updates', 'guide'] as const).map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setInfoTab(tab)} 
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition-all",
                      infoTab === tab ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  > 
                    {tab === 'updates' ? <Bell size={14} /> : <BookOpen size={14} />} 
                    {tab} 
                  </button>
                ))}
              </div>

              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                {infoTab === 'updates' ? (
                  <div className="space-y-1 p-1">
                    {NOTIFICATIONS.map((note) => (
                      <div key={note.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors group">
                        <div className="flex items-center gap-2 mb-1.5">
                          {note.type === 'info' ? <Zap size={12} className="text-blue-400"/> : <Sparkles size={12} className="text-purple-400"/>}
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
                          <p><span className="text-white font-medium">Auto Fix:</span> Use if video buffers.</p>
                          <p><span className="text-white font-medium">Home Button:</span> Safe exit from embeds.</p>
                          <p><span className="text-white font-medium">Vidly Subtitles:</span> Use <span className="underline decoration-yellow-400/50">External</span> (👂) subs.</p>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Mobile Menu (Floating Sheet) --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="pointer-events-auto absolute top-20 left-4 right-4 z-[60] bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto"
            >
               <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {NAV_ITEMS.map((item) => { 
                      const isActive = pathname === item.href; 
                      return ( 
                        <Link 
                          key={item.href} 
                          href={item.href} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-200",
                            isActive 
                              ? "bg-white text-black border-white shadow-lg" 
                              : "bg-white/5 text-gray-400 border-transparent hover:bg-white/10"
                          )}
                        >
                          <item.icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                          <span className="text-xs font-medium">{item.label}</span>
                        </Link> 
                      ); 
                    })}
                  </div>
                  
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); toggleActivity(); }} 
                    className="w-full flex items-center justify-between px-5 py-4 bg-white/5 rounded-2xl border border-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-full"><History size={16} /></div>
                      <span className="text-sm font-medium text-white">Activity</span>
                    </div>
                    <ChevronRight size={16} className="opacity-50" />
                  </button>

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

      {/* --- Search Curtain (Modal) --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            {/* Centered Search Bar Container */}
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-[101] pointer-events-auto"
            >
              <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl ring-1 ring-white/5">
                <SearchBar onClose={() => setIsSearchOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

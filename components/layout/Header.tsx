'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useMotionValueEvent, 
  useSpring,
  useTransform
} from 'framer-motion';
import { 
  Search, Menu, Home, Film, Tv, Grid3X3, X, History, 
  Bell, ChevronRight, Zap, Sparkles 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility: 2026 Standard Class Merger ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Data ---
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tvshows', label: 'TV Shows', icon: Tv },
  { href: '/genres', label: 'Genres', icon: Grid3X3 },
];

const NOTIFICATIONS = [
  { id: 1, title: 'Atto4 Stable', desc: 'v2.0 is live. 0ms latency.', type: 'sys' },
  { id: 2, title: 'New Player', desc: 'Home button added to player UI.', type: 'feat' },
];

// --- Sub-Components ---

// 1. Magnetic Nav Item with Spatial Slide
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
      {/* Icon only visible on hover or active to reduce noise */}
      <span className={cn("transition-all duration-300", isActive ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden group-hover:w-auto group-hover:opacity-100")}>
         <item.icon size={14} />
      </span>
      {item.label}
    </span>
  </Link>
);

// 2. Search Morphing Input
const SearchInput = ({ onClose }: { onClose: () => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Auto-focus with a slight delay to allow animation to start
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center w-full px-2"
    >
      <Search className="text-white/50 mr-3" size={18} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search titles, genres, or people..."
        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-sm font-medium h-full"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
        <div className="text-[10px] bg-white/10 px-1.5 rounded text-white/50 font-mono">ESC</div>
      </button>
    </motion.div>
  );
};

// --- Main Header Component ---

export default function Header() {
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const lastYRef = useRef(0);

  const pathname = usePathname();
  const router = useRouter();

  // Scroll Physics: Hide on scroll down, show on scroll up (Velocity aware)
  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastYRef.current;
    if (Math.abs(diff) > 50) { // Threshold to prevent jitter
      setIsHidden(diff > 0 && latest > 100);
      lastYRef.current = latest;
    }
  });

  // Reset states on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchMode(false);
    setShowNotifs(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: -100 }
        }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        {/* 
            THE CAPSULE 
            Uses Layout Animation to morph width/height based on state 
        */}
        <motion.div
          layout
          className={cn(
            "pointer-events-auto relative backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden",
            // Dynamic Sizing
            isSearchMode ? "w-full max-w-2xl rounded-2xl" : "w-auto rounded-full"
          )}
          style={{
            backgroundColor: "rgba(5, 5, 5, 0.65)", // Deep dark glass
          }}
          transition={{ 
            type: "spring", 
            stiffness: 350, 
            damping: 30 
          }}
        >
          {/* Noise Texture Overlay for "Physicality" */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

          <div className="relative z-10 flex items-center justify-between p-1.5">
            
            <AnimatePresence mode="wait" initial={false}>
              {isSearchMode ? (
                // MODE: SEARCH
                <SearchInput key="search-bar" onClose={() => setIsSearchMode(false)} />
              ) : (
                // MODE: NAVIGATION
                <motion.div 
                  key="nav-bar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {/* Logo Area */}
                  <Link href="/" className="flex items-center pl-3 pr-2 group">
                    <div className="w-6 h-6 mr-2 relative">
                      <Image 
                        src="/logo.png" 
                        alt="Logo" 
                        width={24} 
                        height={24} 
                        className="object-contain group-hover:rotate-90 transition-transform duration-500" 
                      />
                    </div>
                    <span className="font-bold text-white tracking-tight hidden sm:block">Atto4</span>
                  </Link>

                  {/* Divider */}
                  <div className="w-px h-4 bg-white/10 mx-1 hidden md:block" />

                  {/* Desktop Nav */}
                  <nav className="hidden md:flex items-center">
                    {NAV_ITEMS.map((item) => (
                      <NavItem key={item.href} item={item} isActive={pathname === item.href} />
                    ))}
                  </nav>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1 pl-2">
                    <button 
                      onClick={() => setIsSearchMode(true)}
                      className="p-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Search size={18} />
                    </button>

                    <div className="relative">
                      <button 
                        onClick={() => setShowNotifs(!showNotifs)}
                        className={cn(
                          "p-2.5 rounded-full transition-colors relative",
                          showNotifs ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Bell size={18} />
                        {!showNotifs && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                      </button>
                      
                      {/* Notifications Dropdown - Spatial pop-in */}
                      <AnimatePresence>
                        {showNotifs && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute top-full right-0 mt-4 w-80 p-2 rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-2xl overflow-hidden"
                          >
                            <div className="text-[10px] uppercase font-bold text-white/30 px-3 py-2 tracking-widest">System Updates</div>
                            {NOTIFICATIONS.map(n => (
                              <div key={n.id} className="p-3 hover:bg-white/5 rounded-xl group cursor-pointer transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                  {n.type === 'sys' ? <Zap size={12} className="text-yellow-400"/> : <Sparkles size={12} className="text-purple-400"/>}
                                  <span className="text-xs font-semibold text-white">{n.title}</span>
                                </div>
                                <div className="text-xs text-white/50 leading-relaxed">{n.desc}</div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      onClick={() => router.push('/donate')}
                      className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black font-bold shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-transform"
                    >
                      <Image src="/donation.svg" width={16} height={16} alt="Donate" className="invert-0" />
                    </button>

                    <button 
                      onClick={() => setIsMenuOpen(true)}
                      className="md:hidden p-2.5 text-white/70 hover:text-white"
                    >
                      <Menu size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.header>

      {/* 
          MOBILE MENU OVERLAY 
          Uses pure CSS backdrop-filter for performance, Framer for entry 
      */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#050505] border-l border-white/10 p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10">
                <span className="text-xl font-bold text-white tracking-tighter">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all",
                      pathname === item.href ? "bg-white text-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-lg">{item.label}</span>
                    {pathname === item.href && <ChevronRight className="ml-auto" size={16} />}
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-8 left-6 right-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <History size={16} />
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Last Watched</div>
                      <div className="text-sm text-white font-medium truncate">Interstellar (2014)</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

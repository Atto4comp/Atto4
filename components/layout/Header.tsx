'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, Menu, Home, Film, Tv, Grid3X3, X, History, 
  Bell, BookOpen, AlertCircle, PlayCircle, RefreshCw, 
  ChevronRight, ExternalLink 
} from 'lucide-react'; 
import SearchBar from '@/components/common/SearchBar';

// --- Types & Constants ---

type NavItem = { href: string; label: string; icon: any };

const NAV_ITEMS: NavItem[] = [
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
];

// --- Sub-Components (Clean Architecture) ---

const NavPill = memo(({ item, isActive }: { item: NavItem; isActive: boolean }) => (
  <Link 
    href={item.href}
    className={`
      group relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-out
      ${isActive 
        ? 'text-black bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
        : 'text-gray-400 hover:text-white hover:bg-white/10'
      }
    `}
  >
    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
    <span className="relative z-10">{item.label}</span>
  </Link>
));
NavPill.displayName = 'NavPill';

const IconButton = ({ 
  icon: Icon, onClick, active, badge 
}: { 
  icon: any; onClick: () => void; active?: boolean; badge?: boolean 
}) => (
  <button
    onClick={onClick}
    className={`
      relative p-2.5 rounded-full transition-all duration-300 group
      ${active 
        ? 'bg-white text-black shadow-lg scale-110' 
        : 'text-gray-400 hover:text-white hover:bg-white/10'
      }
    `}
  >
    <Icon size={20} strokeWidth={2} />
    {badge && (
      <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-black/50" />
    )}
  </button>
);

// --- Main Component ---

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false); 
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates'); 
  const [scrolled, setScrolled] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Optimized Scroll Handler
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click Outside Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsInfoPanelOpen(false);
      }
    };
    if (isInfoPanelOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoPanelOpen]);

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
      {/* --- Floating Capsule Header --- */}
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${scrolled ? 'py-3' : 'py-6'}
        `}
      >
        <div 
          className={`
            relative flex items-center px-2 py-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-xl transition-all duration-500
            ${scrolled 
              ? 'bg-black/40 shadow-black/20 supports-[backdrop-filter]:bg-black/20' 
              : 'bg-white/5 shadow-black/10 supports-[backdrop-filter]:bg-white/5'
            }
          `}
        >
          {/* Logo Section */}
          <Link href="/" className="flex items-center group px-4 pl-5">
            <div className="relative w-8 h-8 mr-3 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
              <Image 
                src="/logo.png" 
                alt="Atto4" 
                width={32} 
                height={32} 
                className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-chillax font-bold text-lg text-white tracking-tight leading-none">Atto4</span>
              <span className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase leading-none mt-1 group-hover:text-blue-400 transition-colors">Stream</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center bg-white/5 rounded-full px-1.5 py-1.5 mx-2 border border-white/5">
            {NAV_ITEMS.map((item) => (
              <NavPill key={item.href} item={item} isActive={pathname === item.href} />
            ))}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-1 pl-2 pr-1">
            <IconButton 
              icon={isSearchOpen ? X : Search} 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              active={isSearchOpen}
            />
            
            <IconButton 
              icon={History} 
              onClick={toggleActivity} 
            />

            {/* Notification Panel Wrapper */}
            <div className="relative" ref={panelRef}>
              <IconButton 
                icon={Bell} 
                onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} 
                active={isInfoPanelOpen}
                badge={true}
              />

              {/* Dropdown Panel */}
              <div 
                className={`
                  absolute top-full right-0 mt-6 w-[360px] 
                  bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden origin-top-right transition-all duration-300
                  ${isInfoPanelOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 -translate-y-4 invisible'
                  }
                `}
              >
                {/* Panel Header */}
                <div className="flex border-b border-white/5 p-1.5 bg-white/[0.02]">
                  {(['updates', 'guide'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setInfoTab(tab)} 
                      className={`
                        flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl transition-all
                        ${infoTab === tab 
                          ? 'bg-white/10 text-white shadow-inner' 
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }
                      `}
                    > 
                      {tab === 'updates' ? <Bell size={14} /> : <BookOpen size={14} />} 
                      {tab} 
                    </button>
                  ))}
                </div>

                {/* Panel Content */}
                <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {infoTab === 'updates' ? (
                    NOTIFICATIONS.map((note) => (
                      <div key={note.id} className="p-4 hover:bg-white/5 rounded-2xl transition-colors group border border-transparent hover:border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`
                            text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                            ${note.type === 'info' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}
                          `}>
                            {note.type}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">{note.date}</span>
                        </div>
                        <h4 className="text-sm font-medium text-white mb-1 group-hover:text-blue-300 transition-colors">{note.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{note.desc}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                          <PlayCircle size={12} /> Playback
                        </h4>
                        <div className="text-xs text-gray-400 space-y-2 pl-4 border-l border-white/10">
                          <p>Use <span className="text-white">Auto Fix</span> if video buffers.</p>
                          <p>The <span className="text-white">Home Button</span> inside player ensures safe exit.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Donation Button (Desktop) */}
            <button 
              onClick={() => router.push('/donate')} 
              className="hidden sm:flex ml-2 p-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 transition-all border border-yellow-500/10 hover:border-yellow-500/30" 
              aria-label="Donate"
            >
              <Image src="/donation.svg" alt="Donate" width={20} height={20} className="w-5 h-5 object-contain" />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="sm:hidden ml-1 p-2.5 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* --- Search Curtain --- */}
      <div 
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300
          ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={() => setIsSearchOpen(false)}
      />
      <div 
        className={`
          fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 transition-all duration-300 ease-out origin-top
          ${isSearchOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
         <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 shadow-2xl overflow-hidden ring-1 ring-white/5">
            {isSearchOpen && <SearchBar onClose={() => setIsSearchOpen(false)} />}
         </div>
      </div>

      {/* --- Mobile Menu (Full Screen Glass) --- */}
      <div 
        className={`
          fixed inset-0 z-[60] bg-black/90 backdrop-blur-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-between items-center mb-8">
            <span className="text-white font-chillax text-2xl font-bold tracking-tight">Menu</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors border border-white/5"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {NAV_ITEMS.map((item) => { 
              const isActive = pathname === item.href; 
              return ( 
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`
                    flex flex-col items-center justify-center gap-3 py-6 rounded-3xl border transition-all duration-300
                    ${isActive 
                      ? 'bg-white text-black border-white shadow-xl' 
                      : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:border-white/10'
                    }
                  `}
                >
                  <item.icon size={28} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link> 
              ); 
            })}
            
            <button 
              onClick={() => { setIsMobileMenuOpen(false); toggleActivity(); }} 
              className="col-span-2 flex items-center justify-between px-8 py-6 bg-white/5 rounded-3xl border border-white/5 text-gray-300 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <History size={24} />
                <span className="font-medium">Watch History</span>
              </div>
              <ChevronRight size={20} className="opacity-50" />
            </button>
          </div>
          
          <div className="mt-auto">
            <button 
              onClick={() => router.push('/donate')} 
              className="w-full py-5 bg-[#F59E0B] text-black rounded-3xl font-bold text-lg flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              <Image src="/donation.svg" alt="Donate" width={24} height={24} />
              Support Project
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

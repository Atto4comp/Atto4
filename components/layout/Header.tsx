'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  Bell,
  BookOpen,
  ChevronRight,
  Film,
  Grid3X3,
  History,
  Home,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  Tv,
  User,
  X,
  FileText,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOutUser } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

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
    desc: 'A lighter, faster shell built around instant browsing and cleaner focus.',
    date: 'Now',
  },
  {
    id: 2,
    title: 'Player flow improved',
    desc: 'Navigation and quick actions are now easier to reach on both desktop and mobile.',
    date: 'Update',
  },
  {
    id: 3,
    title: 'Search stays in context',
    desc: 'Quick results remain compact so you can jump into a title without leaving the page.',
    date: 'UX',
  },
];

const DesktopNavItem = ({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      'relative px-3.5 py-2 text-[13px] font-medium transition-colors duration-200',
      active ? 'text-white' : 'text-white/40 hover:text-white/72'
    )}
  >
    {active && (
      <motion.span
        layoutId="desktop-nav-dot"
        className="absolute bottom-0 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-white"
        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
      />
    )}
    <span className="relative z-10">{label}</span>
  </Link>
);

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [infoTab, setInfoTab] = useState<'updates' | 'guide'>('updates');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, userDoc, isAdmin, isCreator } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();

  const panelRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 12);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isInfoPanelOpen &&
        panelRef.current &&
        !panelRef.current.contains(target) &&
        notifButtonRef.current &&
        !notifButtonRef.current.contains(target)
      ) {
        setIsInfoPanelOpen(false);
      }

      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        const element = event.target as HTMLElement;
        if (!element.closest('button[aria-label="User menu"]')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoPanelOpen, isUserMenuOpen]);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsInfoPanelOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const toggleActivity = () => window.dispatchEvent(new CustomEvent('toggle-activity-view'));

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-1.5 md:px-5 md:pt-3.5">
        <motion.div
          initial={false}
          animate={{
            width: scrolled ? 'min(1000px, calc(100vw - 16px))' : 'min(1120px, calc(100vw - 16px))',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'pointer-events-auto relative flex items-center gap-1.5 md:gap-2 rounded-2xl px-2 py-1.5 md:px-3.5 md:py-2',
            'backdrop-blur-2xl',
            scrolled
              ? 'border border-white/[0.06] bg-[rgba(5,5,7,0.92)] shadow-[0_4px_24px_-6px_rgba(0,0,0,0.5)]'
              : 'border border-transparent md:border-white/[0.06] bg-transparent md:bg-[rgba(5,5,7,0.5)]'
          )}
        >
          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-2.5 rounded-xl px-1.5 py-1">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <Image src="/logo.png" alt="Atto4" width={20} height={20} className="object-contain" priority />
            </div>
            <span className="hidden font-display text-[15px] font-semibold tracking-tight text-white min-[430px]:block">
              Atto4
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="relative z-10 hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <DesktopNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="relative z-10 ml-auto flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="focus-ring rounded-lg p-2 text-white/36 transition-colors duration-150 hover:text-white/72"
              aria-label="Open search"
            >
              <Search className="h-[16px] w-[16px]" />
            </button>

            <button
              onClick={toggleActivity}
              className="focus-ring hidden rounded-lg p-2 text-white/36 transition-colors duration-150 hover:text-white/72 md:inline-flex"
              aria-label="Open activity"
            >
              <History className="h-[16px] w-[16px]" />
            </button>

            <button
              ref={notifButtonRef}
              onClick={() => setIsInfoPanelOpen((current) => !current)}
              className={cn(
                'focus-ring relative rounded-lg p-2 transition-colors duration-150',
                isInfoPanelOpen
                  ? 'text-white/72'
                  : 'text-white/36 hover:text-white/72'
              )}
              aria-label="Open updates"
            >
              <Bell className="h-[16px] w-[16px]" />
              <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-[var(--accent)]" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="focus-ring rounded-lg border border-white/[0.08] bg-white/[0.04] p-2 text-white/56 transition-all duration-150 hover:bg-white/[0.08] hover:text-white"
                  aria-label="User menu"
                >
                  <User className="h-[16px] w-[16px]" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="surface-panel-strong absolute right-0 top-12 z-[70] w-56 overflow-hidden rounded-xl"
                    >
                      <div className="border-b border-white/[0.06] px-4 py-3">
                        <p className="text-sm font-medium text-white">{userDoc?.displayName || 'Account'}</p>
                        <p className="mt-0.5 text-xs text-white/36">{userDoc?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onClick={() => {
                            router.push('/profile');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/56 transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          <User className="h-3.5 w-3.5" />
                          Profile
                        </button>
                        {isCreator && (
                          <button
                            onClick={() => {
                              router.push('/my-submissions');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/56 transition-colors hover:bg-white/[0.05] hover:text-white"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            My Submissions
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              router.push('/admin');
                              setIsUserMenuOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-white/56 transition-colors hover:bg-white/[0.05] hover:text-white"
                          >
                            <Shield className="h-3.5 w-3.5" />
                            Admin Dashboard
                          </button>
                        )}
                      </div>
                      <div className="border-t border-white/[0.06] p-1.5">
                        <button
                          onClick={async () => {
                            await signOutUser();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-red-400/72 transition-colors hover:bg-red-500/[0.06] hover:text-red-300"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden rounded-lg border border-white/[0.1] px-3.5 py-1.5 text-[13px] font-medium text-white/72 transition-all duration-200 hover:border-white/20 hover:text-white md:block"
              >
                Sign In
              </button>
            )}
          </div>
        </motion.div>

        {/* Notification / Info Panel */}
        <AnimatePresence>
          {isInfoPanelOpen && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="surface-panel-strong pointer-events-auto absolute right-3 top-[72px] z-[60] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-xl md:right-5"
            >
              <div className="grid grid-cols-2 gap-0.5 border-b border-white/[0.06] p-1.5">
                {(['updates', 'guide'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInfoTab(tab)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors',
                      infoTab === tab ? 'bg-white/[0.06] text-white/72' : 'text-white/28 hover:text-white/48'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {infoTab === 'updates' ? (
                <div className="space-y-1.5 p-2">
                  {NOTIFICATIONS.map((note) => (
                    <div key={note.id} className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3.5">
                      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/24">
                        <span>{note.date}</span>
                        <Bell className="h-3 w-3" />
                      </div>
                      <h4 className="text-[13px] font-medium text-white/88">{note.title}</h4>
                      <p className="mt-1 text-[12px] leading-[1.6] text-white/40">{note.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 p-2">
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/28">
                      <PlayCircle className="h-3 w-3" />
                      Watching
                    </div>
                    <p className="text-[12px] leading-[1.6] text-white/40">
                      Use quick search to jump in, then open activity when you want to resume something you already started.
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-400/[0.08] bg-amber-400/[0.02] p-3.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-amber-200/48">
                      <AlertCircle className="h-3 w-3" />
                      Playback Help
                    </div>
                    <p className="text-[12px] leading-[1.6] text-white/40">
                      If a source buffers, switch players or reopen the title page to try another stream without losing context.
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/28">
                      <BookOpen className="h-3 w-3" />
                      Discovery
                    </div>
                    <p className="text-[12px] leading-[1.6] text-white/40">
                      Browse by rows for speed, or open the full category views when you want a deeper catalog pass.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-[100] bg-black/64 backdrop-blur-lg"
              aria-label="Close search"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed left-1/2 top-20 z-[101] w-[min(680px,calc(100vw-24px))] -translate-x-1/2"
            >
              <div className="surface-panel-strong rounded-xl p-2.5">
                <SearchBar onClose={() => setIsSearchOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

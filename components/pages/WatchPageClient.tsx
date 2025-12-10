// components/pages/WatchPageClient.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';

interface WatchPageClientProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  season?: number;
  episode?: number;
  title: string;
  mediaData: any;
}

// Small helper to centralize the DevTools trap logic
function startDevtoolsTrap(options?: { intervalMs?: number; thresholdMs?: number }) {
  const intervalMs = options?.intervalMs ?? 200;
  const thresholdMs = options?.thresholdMs ?? 100;
  let trapInterval: number | null = null;

  const preventInspect = (e: KeyboardEvent) => {
    const key = e.key?.toLowerCase();
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && key === 'i') ||
      (e.ctrlKey && key === 'u') ||
      (e.ctrlKey && e.shiftKey && key === 'c')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  };

  const preventContext = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const triggerLockdown = () => {
    try {
      // Remove everything visible as fast as possible
      document.documentElement.innerHTML = '';
      document.body.style.backgroundColor = 'black';
      // Optionally clear sensitive state (avoid aggressive wiping of user data)
      try { localStorage.clear(); } catch {}
      try { sessionStorage.clear(); } catch {}
    } finally {
      // Force navigation away
      // use replace so back button doesn't return to the page
      window.location.replace('about:blank');
    }
  };

  const runTrap = () => {
    const t0 = performance.now();
    // The `debugger` will pause execution if DevTools is open and set to pause on script
    // The time gap after calling debugger indicates DevTools presence
    // eslint-disable-next-line no-debugger
    debugger;
    const t1 = performance.now();
    if (t1 - t0 > thresholdMs) {
      triggerLockdown();
    }
  };

  // Install protections
  document.addEventListener('contextmenu', preventContext, { passive: false });
  document.addEventListener('keydown', preventInspect, { passive: false });

  // Frequent trap interval
  trapInterval = window.setInterval(runTrap, intervalMs);

  // Return cleanup function
  return () => {
    if (trapInterval !== null) {
      clearInterval(trapInterval);
      trapInterval = null;
    }
    document.removeEventListener('contextmenu', preventContext);
    document.removeEventListener('keydown', preventInspect as any);
  };
}

export default function WatchPageClient({
  mediaType,
  mediaId,
  season = 1,
  episode = 1,
  title,
  mediaData,
}: WatchPageClientProps) {
  const router = useRouter();
  const trapCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Start the DevTools trap on mount
    trapCleanup.current = startDevtoolsTrap({ intervalMs: 200, thresholdMs: 100 });

    return () => {
      // cleanup on unmount
      if (trapCleanup.current) {
        trapCleanup.current();
        trapCleanup.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Hide body scroll for fullscreen experience
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  // Render movie player
  if (mediaType === 'movie') {
    return (
      <MoviePlayer
        mediaId={mediaId}
        title={title}
        onClose={handleClose}
      />
    );
  }

  // Render TV player
  if (mediaType === 'tv') {
    return (
      <TvPlayer
        mediaId={mediaId}
        season={season}
        episode={episode}
        title={title}
        onClose={handleClose}
      />
    );
  }

  return null;
}

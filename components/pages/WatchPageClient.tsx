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

export default function WatchPageClient({
  mediaType,
  mediaId,
  season = 1,
  episode = 1,
  title,
  mediaData,
}: WatchPageClientProps) {
  const router = useRouter();
  const trapInterval = useRef<NodeJS.Timeout | null>(null);

  // 🛡️ AGGRESSIVE DEVTOOLS PROTECTION (Direct Implementation)
  useEffect(() => {
    // 1. Disable Interactions
    const preventInspect = (e: any) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', preventInspect);

    // 2. The Trap Loop
    const runTrap = () => {
      const start = performance.now();
      
      // 🛑 THIS PAUSES EXECUTION IF DEVTOOLS IS OPEN
      debugger; 
      
      const end = performance.now();
      
      // If execution paused for > 100ms, DevTools is open.
      if (end - start > 100) {
        // 🚨 WIPE DOM IMMEDIATELY
        document.body.innerHTML = '';
        document.body.style.backgroundColor = 'black';
        
        // 🚨 REDIRECT
        window.location.href = "about:blank";
      }
    };

    // Run extremely frequently (every 200ms)
    trapInterval.current = setInterval(runTrap, 200);

    return () => {
      if (trapInterval.current) clearInterval(trapInterval.current);
      document.removeEventListener('keydown', preventInspect);
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, []);

  // Lock body scroll
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

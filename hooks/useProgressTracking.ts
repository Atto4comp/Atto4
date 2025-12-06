// hooks/useProgressTracking.ts
'use client';

import { useEffect } from 'react';
import { progressStorage } from '@/lib/storage/progress';

interface TrackingProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  poster?: string | null; // We might need to pass this down
}

export function useProgressTracking({ 
  mediaId, 
  mediaType, 
  title, 
  season, 
  episode 
}: TrackingProps) {
  useEffect(() => {
    // Save immediately on mount (start watching)
    progressStorage.saveProgress({
      id: Number(mediaId),
      mediaType,
      title,
      poster_path: null, // We often don't have this in player, might need to fetch or ignore
      backdrop_path: null,
      season,
      episode
    });

    // Optional: Update "last watched" timestamp every minute while player is open
    const interval = setInterval(() => {
      progressStorage.saveProgress({
        id: Number(mediaId),
        mediaType,
        title,
        poster_path: null, 
        backdrop_path: null,
        season,
        episode
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [mediaId, mediaType, title, season, episode]);
}

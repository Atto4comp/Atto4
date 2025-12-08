// hooks/useProgressTracking.ts
'use client';

import { useEffect, useRef } from 'react';
import { progressStorage } from '@/lib/storage/progress';

interface TrackingProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  poster?: string | null;
  backdrop?: string | null;
  playerRef?: React.RefObject<HTMLVideoElement>; // Optional if we had a direct video tag
}

export function useProgressTracking({ 
  mediaId, 
  mediaType, 
  title, 
  season, 
  episode,
  poster,
  backdrop
}: TrackingProps) {
  const saveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Initial Save (Start Watching) - Position 0 if new
    progressStorage.saveProgress({
      id: Number(mediaId),
      mediaType,
      title,
      poster_path: poster || null,
      backdrop_path: backdrop || null,
      season,
      episode,
      position: 0, // Will be overwritten if we had previous progress, but safe default
      duration: 0
    });

    // 2. Heartbeat Save (Every 10 seconds)
    // Since we are using IFRAMES, we cannot access 'currentTime' directly.
    // We assume if the component is mounted, the user is watching.
    // We just update "lastWatched" timestamp. 
    // If we had a direct <video>, we would save 'currentTime'.
    saveInterval.current = setInterval(() => {
      progressStorage.saveProgress({
        id: Number(mediaId),
        mediaType,
        title,
        poster_path: poster || null,
        backdrop_path: backdrop || null,
        season,
        episode,
        position: 0, // We can't track exact seconds in iframe, so 0 is placeholder
        duration: 0
      });
    }, 10000); // 10s throttle

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [mediaId, mediaType, title, season, episode, poster, backdrop]);
}

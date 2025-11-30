// components/pages/WatchPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';

interface WatchPageClientProps {
  mediaType: 'movie' | 'tv'; // Changed from string to specific union
  mediaId: number;
  season?: number;
  episode?: number;
  title: string;
  mediaData: any; // Keeping flexible for now, but better typed as Movie | TVShow
}

export default function WatchPageClient({
  mediaType,
  mediaId,
  season,
  episode,
  title,
  mediaData,
}: WatchPageClientProps) {
  const router = useRouter();

  // Optional: You could move the DevTools protection here if you want
  // to protect the entire page, not just the player iframe.
  // useDevToolsProtection(); 

  const handleClose = () => {
    router.back();
  };

  // Render the correct player wrapper
  if (mediaType === 'movie') {
    return (
      <div className="w-screen h-screen bg-black overflow-hidden">
        <MoviePlayer 
          mediaId={mediaId} 
          title={title} 
          onClose={handleClose} 
        />
      </div>
    );
  }

  if (mediaType === 'tv') {
    return (
      <div className="w-screen h-screen bg-black overflow-hidden">
        <TvPlayer
          mediaId={mediaId}
          season={season || 1}
          episode={episode || 1}
          title={title}
          onClose={handleClose}
        />
      </div>
    );
  }

  return null;
}

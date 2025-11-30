'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';
// Uncomment if you want to protect the entire page, not just the player
// import { useDevToolsProtection } from '@/hooks/useDevToolsProtection'; 

interface WatchPageClientProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  season?: number;
  episode?: number;
  title: string;
  mediaData: any; // Can be typed more strictly if you share types (Movie | TVShow)
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

  // 🛡️ OPTIONAL: Protect the entire Watch Page from inspection
  // useDevToolsProtection();

  const handleClose = () => {
    router.back();
  };

  // Render the correct player wrapper
  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {mediaType === 'movie' ? (
        <MoviePlayer 
          mediaId={mediaId} 
          title={title} 
          onClose={handleClose} 
        />
      ) : (
        <TvPlayer
          mediaId={mediaId}
          season={season || 1}
          episode={episode || 1}
          title={title}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

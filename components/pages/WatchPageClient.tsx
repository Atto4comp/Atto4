'use client';

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
  season, // These come from the URL searchParams (Server Side)
  episode,
  title,
  mediaData,
}: WatchPageClientProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

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
          // Pass the values directly. 
          // If they are undefined, TvPlayer will handle its own defaults (usually 1)
          season={season ?? 1}
          episode={episode ?? 1}
          title={title}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

// components/pages/WatchPageClient.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';
import { useDevToolsProtection } from '@/hooks/useDevToolsProtection'; // ✅ Import Hook

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

  // ✅ ACTIVATE DEVTOOLS PROTECTION
  // This triggers the trap immediately when the watch page mounts
  useDevToolsProtection();

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
        // Passed props for compatibility
        // guardMs={6000} 
        // showControls={true}
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
        guardMs={5000}
        autoNextMs={25 * 60 * 1000} 
        showControls={true}
      />
    );
  }

  // Fallback
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Unsupported media type</h1>
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

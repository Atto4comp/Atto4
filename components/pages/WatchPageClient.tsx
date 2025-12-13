'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

// New Imports
import HLSPlayer from '@/components/player/HLSPlayer';
import { providers } from '@/lib/providers/base'; // Your scraper engine
import { Stream } from '@p-stream/providers'; // Type definitions

interface WatchPageClientProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  season?: number;
  episode?: number;
  title: string;
  mediaData: any; // Contains poster_path, backdrop_path, etc.
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

  // Scraper State
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      debugger; 
      const end = performance.now();
      
      if (end - start > 100) {
        document.body.innerHTML = '';
        document.body.style.backgroundColor = 'black';
        window.location.href = "about:blank";
      }
    };

    trapInterval.current = setInterval(runTrap, 200);

    return () => {
      if (trapInterval.current) clearInterval(trapInterval.current);
      document.removeEventListener('keydown', preventInspect);
    };
  }, []);

  // 🎥 SCRAPING LOGIC
  useEffect(() => {
    let isMounted = true;

    async function fetchStream() {
      try {
        setLoading(true);
        setError(null);

        // Run the scraper engine
        const output = await providers.runAll({
          media: {
            type: mediaType,
            title: title,
            tmdbId: String(mediaId),
            releaseYear: new Date(mediaData?.release_date || mediaData?.first_air_date || Date.now()).getFullYear(),
            season: {
              number: season,
              tmdbId: String(season) // Placeholder if unknown
            },
            episode: {
              number: episode,
              tmdbId: String(episode) // Placeholder
            }
          }
        });

        if (isMounted) {
          if (output && output.stream) {
            setStream(output.stream);
          } else {
            setError("No stream found for this title.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Scraping error:", err);
          setError(err.message || "Failed to load stream.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, [mediaType, mediaId, season, episode, title, mediaData]);

  // Lock body scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, []);

  const handleClose = () => {
    router.back();
  };

  const posterUrl = mediaData?.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${mediaData.backdrop_path}`
    : undefined;

  // 1. Loading State
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-white/70 font-medium animate-pulse">Searching best servers...</p>
      </div>
    );
  }

  // 2. Error State
  if (error || !stream) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6 p-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Stream Unavailable</h2>
          <p className="text-gray-400 mb-6">{error || "We couldn't find a source for this video."}</p>
          <button 
            onClick={handleClose}
            className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // 3. Success - Render HLS Player
  // We extract the playlist URL. If it's HLS, it's stream.playlist. 
  // If it's file, we check qualities.
  let streamUrl = '';
  
  if (stream.type === 'hls') {
    streamUrl = stream.playlist;
  } else if (stream.type === 'file') {
    // Pick the best quality or 'unknown'
    const qualities = stream.qualities;
    streamUrl = qualities['1080']?.url || qualities['720']?.url || qualities['unknown']?.url || '';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <HLSPlayer 
        src={streamUrl} 
        headers={stream.headers} // Inject headers from scraper
        title={mediaType === 'tv' ? `${title} - S${season} E${episode}` : title} 
        poster={posterUrl}
        onClose={handleClose}
      />
    </div>
  );
}

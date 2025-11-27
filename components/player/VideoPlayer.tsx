// components/players/VideoPlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onClose?: () => void;
  showBackButton?: boolean;
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  onClose,
  showBackButton = true
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // ✅ Basic content protection (non-aggressive)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent right-click on video only
    function preventVideoContext(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME' || target.closest('iframe')) {
        e.preventDefault();
      }
    }

    // Prevent common shortcuts (less aggressive)
    function preventShortcuts(e: KeyboardEvent) {
      // Prevent Ctrl+U (view source)
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        return;
      }
      // Prevent F12 (dev tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }
    }

    document.addEventListener('contextmenu', preventVideoContext);
    document.addEventListener('keydown', preventShortcuts);

    return () => {
      document.removeEventListener('contextmenu', preventVideoContext);
      document.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  // ✅ Load embed URL
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      let result: { embedUrl: string; provider: string } | null = null;

      if (mediaType === 'movie') {
        result = getMovieEmbed(mediaId);
      } else if (mediaType === 'tv') {
        result = getTVEmbed(mediaId, season, episode);
      }

      if (result && result.embedUrl) {
        setEmbedUrl(result.embedUrl);
        setLoading(false);
      } else {
        setError('No streaming source available');
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load video:', err);
      setError('Failed to load video player');
      setLoading(false);
    }
  }, [mediaId, mediaType, season, episode]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading player...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !embedUrl) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Playback Error</h2>
          <p className="text-gray-400 mb-6">
            {error || 'Unable to load video source'}
          </p>
          <button
            onClick={handleClose}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Video player
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header with Back Button */}
      {showBackButton && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 md:p-6">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm md:text-base font-medium">Back</span>
          </button>
          {title && (
            <h1 className="text-white text-lg md:text-xl font-semibold mt-2 truncate">
              {title}
            </h1>
          )}
        </div>
      )}

      {/* Video Iframe */}
      <div className="flex-1 relative">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
          title={title || 'Video Player'}
        />
      </div>
    </div>
  );
}

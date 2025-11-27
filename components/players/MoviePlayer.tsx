// components/players/MoviePlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Settings } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';

interface MoviePlayerProps {
  mediaId: number | string;
  title: string;
  onClose?: () => void;
  guardMs?: number;
  showControls?: boolean;
}

export default function MoviePlayer({
  mediaId,
  title,
  onClose,
  guardMs = 6000,
  showControls = true,
}: MoviePlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ Load movie embed
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const result = getMovieEmbed(mediaId);
      
      if (result && result.embedUrl) {
        setEmbedUrl(result.embedUrl);
        console.log(`🎬 Movie player loaded: ${title} from ${result.provider}`);
        setLoading(false);
      } else {
        setError('No streaming source available for this movie');
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load movie:', err);
      setError('Failed to load movie player');
      setLoading(false);
    }
  }, [mediaId, title]);

  // ✅ Basic content protection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const preventContext = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IFRAME') {
        e.preventDefault();
      }
    };

    const preventShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'u') || e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventShortcuts);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventShortcuts);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading {title}...</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Unable to Play</h2>
          <p className="text-gray-400 mb-2">{error || 'Video source not available'}</p>
          <p className="text-sm text-gray-500 mb-6">Try again later or contact support</p>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Movie player
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm md:text-base font-medium">Back</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-white hover:text-gray-300 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <h1 className="text-white text-lg md:text-2xl font-bold mt-4 truncate drop-shadow-lg">
            {title}
          </h1>
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
          title={`Watch ${title}`}
        />
      </div>
    </div>
  );
}

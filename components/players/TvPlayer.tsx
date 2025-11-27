// components/players/TvPlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTVEmbed } from '@/lib/api/video-tv';

interface TvPlayerProps {
  mediaId: number | string;
  season: number;
  episode: number;
  title: string;
  onClose?: () => void;
  guardMs?: number;
  autoNextMs?: number;
  showControls?: boolean;
}

export default function TvPlayer({
  mediaId,
  season,
  episode,
  title,
  onClose,
  guardMs = 5000,
  autoNextMs,
  showControls = true,
}: TvPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);

  const router = useRouter();

  // ✅ Load TV embed
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const result = getTVEmbed(mediaId, currentSeason, currentEpisode);
      
      if (result && result.embedUrl) {
        setEmbedUrl(result.embedUrl);
        console.log(`📺 TV player loaded: ${title} S${currentSeason}E${currentEpisode} from ${result.provider}`);
        setLoading(false);
      } else {
        setError(`Episode S${currentSeason}E${currentEpisode} not available`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load episode:', err);
      setError('Failed to load episode player');
      setLoading(false);
    }
  }, [mediaId, currentSeason, currentEpisode, title]);

  // ✅ Update URL when episode changes
  useEffect(() => {
    if (currentSeason !== season || currentEpisode !== episode) {
      const newUrl = `/watch/tv/${mediaId}?season=${currentSeason}&episode=${currentEpisode}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [currentSeason, currentEpisode, mediaId, season, episode, router]);

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

  // Episode navigation
  const goToPrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode(currentEpisode - 1);
    } else if (currentSeason > 1) {
      setCurrentSeason(currentSeason - 1);
      setCurrentEpisode(1); // Reset to episode 1 of previous season
    }
  };

  const goToNextEpisode = () => {
    setCurrentEpisode(currentEpisode + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4" />
          <p className="text-white text-lg">Loading Episode {currentEpisode}...</p>
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
          <h2 className="text-2xl font-bold text-white mb-2">Episode Unavailable</h2>
          <p className="text-gray-400 mb-6">
            {error || 'This episode is not available yet'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Go Back
            </button>
            {currentEpisode > 1 && (
              <button
                onClick={goToPrevEpisode}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Previous Episode
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TV player
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header Controls */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm md:text-base font-medium">Back</span>
            </button>

            {/* Episode Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevEpisode}
                disabled={currentSeason === 1 && currentEpisode === 1}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous Episode"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <span className="text-white font-semibold text-sm">
                  S{currentSeason} E{currentEpisode}
                </span>
              </div>

              <button
                onClick={goToNextEpisode}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Next Episode"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h1 className="text-white text-lg md:text-2xl font-bold truncate drop-shadow-lg">
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
          title={`Watch ${title} - Season ${currentSeason} Episode ${currentEpisode}`}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Server, RefreshCw } from 'lucide-react';
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
  // State tracks INDEX of the source, not just URL
  const [currentSourceIndex, setCurrentSourceIndex] = useState<number>(0);
  const [sources, setSources] = useState<{ url: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showServers, setShowServers] = useState(false);
  const [isAutoSwitching, setIsAutoSwitching] = useState(false);

  const router = useRouter();

  // Load Sources
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentSourceIndex(0); // Reset to first server on new media load

    const loadSources = async () => {
      try {
        let result;
        if (mediaType === 'movie') {
          result = await getMovieEmbed(mediaId);
        } else {
          result = await getTVEmbed(mediaId, season, episode);
        }

        if (result.allSources && result.allSources.length > 0) {
          setSources(result.allSources);
          setLoading(false);
        } else {
          setError('No sources available for this title.');
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load video sources.');
        setLoading(false);
      }
    };

    loadSources();
  }, [mediaId, mediaType, season, episode]);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  // AUTOMATED SWITCHING LOGIC
  const handleSourceError = useCallback(() => {
    if (sources.length <= 1) return; // No other sources to try

    setIsAutoSwitching(true);
    
    // Small delay to show UI feedback that we are switching
    setTimeout(() => {
      setCurrentSourceIndex((prev) => {
        const nextIndex = (prev + 1) % sources.length;
        return nextIndex;
      });
      setIsAutoSwitching(false);
    }, 1500);
  }, [sources.length]);

  if (loading) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center text-white bg-white/10 p-8 rounded-xl backdrop-blur-md border border-white/10">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-6">{error}</p>
        <button 
          onClick={handleClose} 
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Close Player
        </button>
      </div>
    </div>
  );

  // Get current source safely
  const currentUrl = sources[currentSourceIndex]?.url;
  const currentLabel = sources[currentSourceIndex]?.label;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showBackButton && (
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none transition-opacity hover:opacity-100">
          <button onClick={handleClose} className="pointer-events-auto flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm md:text-base drop-shadow-md max-w-[200px] md:max-w-md truncate">
              {title || 'Back'}
            </span>
          </button>

          <div className="pointer-events-auto relative flex gap-3">
            {/* AUTO-FIX BUTTON */}
            <button
              onClick={handleSourceError}
              disabled={isAutoSwitching}
              className="flex items-center gap-2 bg-red-500/20 text-red-200 hover:bg-red-500/30 backdrop-blur-md px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-red-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${isAutoSwitching ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isAutoSwitching ? 'Switching...' : 'Auto Fix'}</span>
            </button>

            {/* SERVER SELECTOR */}
            <div className="relative">
              <button 
                onClick={() => setShowServers(!showServers)}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-white/20 border border-white/10 transition-all text-white"
              >
                <Server className="w-3 h-3 md:w-4 md:h-4" />
                <span>{currentLabel || 'Server'}</span>
              </button>

              {showServers && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30">
                  <div className="p-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {sources.map((src, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentSourceIndex(idx);
                          setShowServers(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all ${
                          currentSourceIndex === idx 
                            ? 'bg-white text-black font-bold shadow-lg' 
                            : 'text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{src.label}</span>
                          {currentSourceIndex === idx && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SWITCHING OVERLAY */}
      {isAutoSwitching && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-white animate-pulse">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-500" />
            <p className="font-medium text-lg">Trying next server...</p>
            <p className="text-sm text-gray-400">Attempting to load video from {sources[(currentSourceIndex + 1) % sources.length]?.label}</p>
          </div>
        </div>
      )}

      {/* VIDEO IFRAME */}
      {currentUrl && (
        <iframe
          key={currentUrl} // Force reload on URL change
          src={currentUrl}
          className="w-full h-full border-0 bg-black"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="origin"
          // 🛡️ SECURITY: Blocks redirects/popups while allowing video playback
          sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          onError={handleSourceError} 
        />
      )}
    </div>
  );
}

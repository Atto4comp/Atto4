// components/players/VideoPlayer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Server } from 'lucide-react';
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
  const [currentSource, setCurrentSource] = useState<string>('');
  const [sources, setSources] = useState<{ url: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showServers, setShowServers] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      let result;
      if (mediaType === 'movie') {
        result = getMovieEmbed(mediaId);
      } else {
        result = getTVEmbed(mediaId, season, episode);
      }

      if (result.allSources && result.allSources.length > 0) {
        setSources(result.allSources);
        setCurrentSource(result.allSources[0].url);
        setLoading(false);
      } else {
        setError('No sources found');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load video');
      setLoading(false);
    }
  }, [mediaId, mediaType, season, episode]);

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={handleClose} className="mt-4 bg-white text-black px-6 py-2 rounded font-bold">Back</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {showBackButton && (
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <button onClick={handleClose} className="pointer-events-auto flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold drop-shadow-md">{title || 'Back'}</span>
          </button>

          <div className="pointer-events-auto relative">
            <button 
              onClick={() => setShowServers(!showServers)}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Server className="w-4 h-4" />
              <span>Change Server</span>
            </button>

            {showServers && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                {sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSource(src.url);
                      setShowServers(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors ${
                      currentSource === src.url ? 'text-green-400 font-bold' : 'text-gray-300'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ Clean Iframe without sandbox restrictions */}
      <iframe
        key={currentSource} // Force reload on source change
        src={currentSource}
        className="w-full h-full border-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="origin"
      />
    </div>
  );
}

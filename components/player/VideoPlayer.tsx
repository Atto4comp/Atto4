'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Server, 
  Settings 
} from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';
import { useProgressTracking } from '@/hooks/useProgressTracking';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  poster?: string | null;
  backdrop?: string | null;
  onClose?: () => void;
}

// 🔓 UNLOCKER
const unlock = (str: string) => {
  try {
    return window.atob(str).split('').reverse().join('');
  } catch (e) {
    return '';
  }
};

export default function VideoPlayer({
  mediaId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  poster,
  backdrop,
  onClose
}: VideoPlayerProps) {
  useProgressTracking({
    mediaId,
    mediaType,
    title: title || 'Unknown Title',
    season,
    episode,
    poster,
    backdrop,
  });

  const [currentSourceIndex, setCurrentSourceIndex] = useState<number>(0);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSwitching, setIsAutoSwitching] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false); // UI toggle

  const router = useRouter();

  // 🛡️ TRAP: Self-Destruct if DevTools Detected
  useEffect(() => {
    const check = setInterval(() => {
      const t0 = Date.now();
      debugger;
      const t1 = Date.now();
      if (t1 - t0 > 100) {
        setBlobUrl(null);
        window.location.replace('about:blank');
      }
    }, 1000);
    return () => clearInterval(check);
  }, []);

  // Load Sources
  useEffect(() => {
    setLoading(true);
    setError(null);
    setCurrentSourceIndex(0);

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
        } else {
          setError('No sources available.');
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

  // 🔐 SECURE BLOB GENERATION
  useEffect(() => {
    const source = sources[currentSourceIndex];
    if (!source) return;

    const createSecureFrame = async () => {
      setLoading(true);
      setBlobUrl(null);

      try {
        let realUrl = '';
        if (source.isEncrypted) {
          const base = unlock(source.encryptedKey);
          realUrl = `${base}${source.mediaId}${source.suffix || ''}`;
        } else {
          realUrl = source.url;
        }

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body, html, iframe { width: 100%; height: 100%; margin: 0; padding: 0; background: #000; border: none; }
              </style>
            </head>
            <body>
              <iframe 
                src="${realUrl}" 
                allowfullscreen="true" 
                webkitallowfullscreen="true" 
                mozallowfullscreen="true"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </body>
          </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
        setIsAutoSwitching(false);
      } catch (err) {
        console.error('Secure frame error', err);
        handleSourceError();
      }
    };

    createSecureFrame();
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [currentSourceIndex, sources]); 

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const handleSourceError = useCallback(() => {
    if (sources.length <= 1) return;
    setIsAutoSwitching(true);
    setTimeout(() => {
      setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
    }, 1500);
  }, [sources.length]);

  const manualSourceSwitch = () => {
    setLoading(true);
    setCurrentSourceIndex((prev) => (prev + 1) % sources.length);
  };

  const reloadPlayer = () => {
    setLoading(true);
    const current = currentSourceIndex;
    setCurrentSourceIndex(-1); // force reset
    setTimeout(() => setCurrentSourceIndex(current), 100);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <div className="text-center text-white bg-white/10 p-8 rounded-xl backdrop-blur-md border border-white/10">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-6">{error}</p>
          <button onClick={handleClose} className="bg-white text-black px-8 py-3 rounded-full font-bold">
            Close Player
          </button>
        </div>
      </div>
    );
  }

  return (
    // Z-INDEX 100 to cover site header (usually z-50)
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* --- TOP CONTROLS --- */}
      <div className={`absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-[110] transition-opacity duration-300 ${showControls || loading ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Back Button */}
        <button 
          onClick={handleClose}
          className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right Side: Server & Tools */}
        <div className="flex gap-3">
          <button 
            onClick={reloadPlayer}
            className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <button 
            onClick={manualSourceSwitch}
            disabled={sources.length <= 1}
            className="flex items-center gap-2 bg-blue-600/80 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-blue-500 transition-all border border-white/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">Server {currentSourceIndex + 1}/{sources.length}</span>
          </button>
        </div>
      </div>

      {/* Loading / Switching State */}
      {(loading || isAutoSwitching) && (
        <div className="absolute inset-0 z-[105] flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
            {isAutoSwitching && <p className="font-medium animate-pulse">Switching server...</p>}
          </div>
        </div>
      )}

      {/* IFRAME */}
      {blobUrl && (
        <iframe
          key={blobUrl}
          src={blobUrl}
          className="w-full h-full border-0 bg-black"
          allowFullScreen
          sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
          onError={handleSourceError}
        />
      )}
    </div>
  );
}

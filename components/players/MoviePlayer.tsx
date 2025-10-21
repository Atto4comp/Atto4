'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';

interface MoviePlayerProps {
  mediaId: number | string;
  title?: string;
  onClose?: () => void;
  backButton?: 'auto' | 'show' | 'hide';
}

export default function MoviePlayer({ 
  mediaId, 
  title, 
  onClose, 
  backButton = 'hide' 
}: MoviePlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackBtn, setShowBackBtn] = useState<boolean>(true);

  const router = useRouter();

  const handleClose = useCallback(() => onClose?.() || router.back(), [onClose, router]);

  const detectEmbedHasBack = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const tokens = [
      'close', 'closebutton', 'close_btn', 'back', 'backbutton', 
      'back_btn', 'return', 'exit', 'dismiss', 'overlay-close', 
      'hasback', 'show_back', 'player-close'
    ];
    return tokens.some(t => lower.includes(t));
  };

  useEffect(() => {
    let mounted = true;

    const loadMovieEmbed = async () => {
      setLoading(true);
      setError('');

      try {
        // Call the embed API synchronously (it's not actually async)
        const result = getMovieEmbed(mediaId);
        if (!mounted) return;

        const url = result?.embedUrl ?? '';
        
        if (!url) {
          setError('No embed URL available for this movie');
          return;
        }

        setEmbedUrl(url);

        // Determine back button visibility
        if (backButton === 'show') {
          setShowBackBtn(true);
        } else if (backButton === 'hide') {
          setShowBackBtn(false);
        } else {
          const hasBack = detectEmbedHasBack(url);
          setShowBackBtn(!hasBack);
        }

        console.log(`🎬 Movie embed URL: ${url}`);
      } catch (err) {
        console.error('Failed to load movie embed:', err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load movie');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMovieEmbed();

    return () => { mounted = false; };
  }, [mediaId, backButton]);

  // Listen for postMessage from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'embed-back-button' && typeof data.hasBackButton === 'boolean') {
          setShowBackBtn(!data.hasBackButton);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading movie player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <h2 className="text-2xl mb-4">Error Loading Movie</h2>
          <p className="mb-6 text-gray-300">{error}</p>
          <button 
            onClick={handleClose} 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center max-w-md px-4">
          <h2 className="text-2xl mb-4">No Stream Available</h2>
          <p className="mb-6 text-gray-300">This movie is not available for streaming.</p>
          <button 
            onClick={handleClose} 
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        style={{ border: 'none' }}
        title={title || 'Movie Player'}
      />

      {showBackBtn && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
            aria-label="Close video and go back"
            title="Close"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

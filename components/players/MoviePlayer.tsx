'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';

interface MoviePlayerProps {
  mediaId: number | string;
  title?: string; // kept for compatibility but not rendered
  onClose?: () => void;
  /**
   * Control back button rendering:
   * - 'auto' (default): try to detect from embed URL and listen for postMessage from iframe
   * - 'show': always show host back button
   * - 'hide': always hide host back button
   */
  backButton?: 'auto' | 'show' | 'hide';
}

export default function MoviePlayer({ mediaId, title, onClose, backButton = 'hide' }: MoviePlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackBtn, setShowBackBtn] = useState<boolean>(true);

  const router = useRouter();

  const handleClose = useCallback(() => onClose?.() || router.back(), [onClose, router]);

  // Heuristic: detect common tokens in the embed URL that hint it already includes a close/back UI
  const detectEmbedHasBack = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const tokens = [
      'close',
      'closebutton',
      'close_btn',
      'back',
      'backbutton',
      'back_btn',
      'return',
      'exit',
      'dismiss',
      'overlay-close',
      'hasback',
      'show_back',
      'player-close'
    ];
    return tokens.some(t => lower.includes(t));
  };

  useEffect(() => {
    let mounted = true;

    const loadMovieEmbed = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await getMovieEmbed(mediaId);
        if (!mounted) return;

        const url = result?.embedUrl ?? '';
        setEmbedUrl(url);

        // Decide show/hide based on backButton prop
        if (backButton === 'show') {
          setShowBackBtn(true);
        } else if (backButton === 'hide') {
          setShowBackBtn(false);
        } else {
          // auto: heuristic detection from URL
          const hasBack = detectEmbedHasBack(url);
          setShowBackBtn(!hasBack);
        }

        console.log(`🎬 Movie URL stored: ${url}`);
      } catch (err) {
        console.error('Failed to load movie embed', err);
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err) || 'Failed to load movie');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMovieEmbed();

    return () => { mounted = false; };
  }, [mediaId, backButton]);

  // Listen to postMessage from embed (best-effort) to allow embed to declare it has its own back/close UI
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'embed-back-button' && typeof data.hasBackButton === 'boolean') {
          // If embed says it has a back button, hide host button; otherwise show it.
          setShowBackBtn(!data.hasBackButton);
        }
      } catch (err) {
        // ignore malformed messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading movie player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-4">Error Loading Movie</h2>
          <p className="mb-4">{error}</p>
          <button onClick={handleClose} className="px-4 py-2 bg-gray-600 rounded">
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
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{ border: 'none' }}
      />

      {/* Only render back button (title intentionally not rendered) */}
      {showBackBtn && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
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


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onClose?: () => void;
  /**
   * Control the back button rendering
   * - 'auto' (default): best-effort detection from embed URL + listen for postMessage from iframe
   * - 'show': always show host UI back button
   * - 'hide': always hide host UI back button
   */
  backButton?: 'auto' | 'show' | 'hide';
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  onClose,
  backButton = 'auto'
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showBackBtn, setShowBackBtn] = useState<boolean>(true);

  const router = useRouter();

  // DevTools protection (same as before)
  useEffect(() => {
    // ... DevTools protection code (same as in TvPlayer)
  }, [router]);

  const handleClose = useCallback(() => onClose ? onClose() : router.back(), [onClose, router]);

  // Helper: heuristic detection from URL for common "close/back" keywords
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
      'parent',
      'dismiss',
      'overlay-close',
      'hasback',
      'show_back'
    ];
    return tokens.some(t => lower.includes(t));
  };

  useEffect(() => {
    // ✅ FIXED: Use correct parameters for TV shows
    let result: any;
    if (mediaType === 'movie') {
      result = getMovieEmbed(mediaId);
    } else {
      // Pass actual season and episode for TV shows
      result = getTVEmbed(mediaId, season, episode);
    }

    // If the embed functions return a promise, support that too
    const resolveResult = async () => {
      try {
        const res = (result && typeof (result as any).then === 'function') ? await result : result;
        const url = res?.embedUrl || '';
        setEmbedUrl(url);

        // Decide back button visibility according to prop
        if (backButton === 'show') {
          setShowBackBtn(true);
        } else if (backButton === 'hide') {
          setShowBackBtn(false);
        } else {
          // "auto": use heuristic detection on the URL as a first pass
          const embedHasBack = detectEmbedHasBack(url);
          setShowBackBtn(!embedHasBack);
        }

        setLoading(false);

        const displayInfo = mediaType === 'tv' ? `S${season}E${episode}` : 'Movie';
        console.log(`${mediaType} embed: ${displayInfo} - ${url}`);
      } catch (err) {
        console.error('Failed to resolve embed result', err);
        setLoading(false);
      }
    };

    resolveResult();
  }, [mediaId, mediaType, season, episode, backButton]);

  // Listen for messages from the iframe (best-effort) so an embed can tell us whether it
  // already renders a back/close button. Protocol: { type: 'embed-back-button', hasBackButton: true }
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Best-effort parsing. Many embeds send structured objects; some post JSON strings.
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'embed-back-button' && typeof data.hasBackButton === 'boolean') {
          // If embed says it has a back button, hide our host button; otherwise show.
          setShowBackBtn(!data.hasBackButton);
        }
      } catch (err) {
        // ignore malformed messages
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Keyboard: allow Esc to close the player (nice UX improvement)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">
          Loading {mediaType === 'tv' ? `Season ${season}, Episode ${episode}` : 'Movie'}...
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

      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        {showBackBtn && (
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Close video and go back"
            title="Close"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {title && (
          <h1 className="text-white font-bold text-lg">
            {title} {mediaType === 'tv' ? `- S${season}E${episode}` : ''}
          </h1>
        )}
      </div>
    </div>
  );
}


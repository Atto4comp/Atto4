'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTVEmbed } from '@/lib/api/video-tv';

interface TvPlayerProps {
  mediaId: number | string;
  season: number;
  episode: number;
  title?: string; // kept for compatibility but not rendered
  onClose?: () => void;
  guardMs?: number;
  autoNextMs?: number;
  showControls?: boolean;
  /**
   * Control back button rendering:
   * - 'auto' (default): detect from embed URL + listen for postMessage from iframe
   * - 'show': always show host back button
   * - 'hide': always hide host back button
   */
  backButton?: 'auto' | 'show' | 'hide';
}

export default function TvPlayer({
  mediaId,
  season,
  episode,
  title, // accepted but not used in UI
  onClose,
  guardMs,
  autoNextMs,
  showControls,
  backButton = 'hide',
}: TvPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showBackBtn, setShowBackBtn] = useState<boolean>(true);

  const router = useRouter();

  const handleClose = useCallback(() => onClose ? onClose() : router.back(), [onClose, router]);

  // DevTools protection (same as before)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function reportDevtoolsAndRedirect() {
      try {
        fetch('/api/report-devtools', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch {}
      try {
        router.replace('/menu');
      } catch {
        try {
          document.documentElement.innerHTML = '<h1 style="color:white;background-color:black;height:100vh;display:flex;align-items:center;justify-content:center;margin:0">Session blocked</h1>';
        } catch {}
      }
    }

    function preventClipboardActions(e: Event) { e.preventDefault(); }
    function preventContextMenu(e: Event) { e.preventDefault(); }

    document.addEventListener('cut', preventClipboardActions);
    document.addEventListener('copy', preventClipboardActions);
    document.addEventListener('paste', preventClipboardActions);
    document.addEventListener('contextmenu', preventContextMenu);

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key.toLowerCase() === 'u') { e.preventDefault(); e.stopPropagation(); return; }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); e.stopPropagation(); return; }
      if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return; }
    }
    document.addEventListener('keydown', onKeyDown);

    let intervalId: number | undefined;
    const threshold = 160;
    let consoleDetected = false;

    const detector = new Image();
    Object.defineProperty(detector, 'id', {
      get() {
        consoleDetected = true;
        return '';
      },
    });

    intervalId = window.setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const viewportDetected = widthDiff > threshold || heightDiff > threshold;

      consoleDetected = false;
      // eslint-disable-next-line no-console
      console.log(detector);

      const detected = viewportDetected || consoleDetected;

      if (detected) {
        if (intervalId) { clearInterval(intervalId); intervalId = undefined; }
        try {
          document.removeEventListener('cut', preventClipboardActions);
          document.removeEventListener('copy', preventClipboardActions);
          document.removeEventListener('paste', preventClipboardActions);
          document.removeEventListener('contextmenu', preventContextMenu);
          document.removeEventListener('keydown', onKeyDown);
        } catch {}
        reportDevtoolsAndRedirect();
      }
    }, 350);

    return () => {
      try {
        if (intervalId) clearInterval(intervalId);
        document.removeEventListener('cut', preventClipboardActions);
        document.removeEventListener('copy', preventClipboardActions);
        document.removeEventListener('paste', preventClipboardActions);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', onKeyDown);
      } catch {}
    };
  }, [router]);

  // Heuristic for back button presence on embed URL
  const detectEmbedHasBack = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const tokens = [
      'close', 'closebutton', 'close_btn', 'back', 'backbutton', 'back_btn', 'return', 'exit', 'dismiss', 'overlay-close', 'hasback', 'show_back', 'player-close'
    ];
    return tokens.some(t => lower.includes(t));
  };

  useEffect(() => {
    setLoading(true);
    let mounted = true;

    try {
      const result = getTVEmbed(mediaId, season, episode);
      Promise.resolve(result)
        .then((res: any) => {
          if (!mounted) return;
          const url = res?.embedUrl ?? '';
          setEmbedUrl(url);

          if (backButton === 'show') setShowBackBtn(true);
          else if (backButton === 'hide') setShowBackBtn(false);
          else setShowBackBtn(!detectEmbedHasBack(url));

          // eslint-disable-next-line no-console
          console.log(`TV embed: S${season}E${episode} - ${url}`);
        })
        .catch((err) => {
          if (!mounted) return;
          console.error('Failed to get TV embed', err);
          setEmbedUrl('');
        })
        .finally(() => { if (mounted) setLoading(false); });
    } catch (err) {
      console.error('Error resolving TV embed', err);
      setEmbedUrl('');
      setLoading(false);
    }

    return () => { mounted = false; };
  }, [mediaId, season, episode, backButton]);

  // postMessage listener for embed to announce its own back/close UI
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'embed-back-button' && typeof data.hasBackButton === 'boolean') {
          setShowBackBtn(!data.hasBackButton);
        }
      } catch {}
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading Season {season}, Episode {episode}...</div>
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


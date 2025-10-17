'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string; // kept for compatibility but not rendered
  onClose?: () => void;
  showBackButton?: boolean; // manual control (default: true)
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  season = 1,
  episode = 1,
  title, // accepted but not used in UI
  onClose,
  showBackButton = false // Default to showing back button
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // DevTools protection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function reportDevtoolsAndRedirect() {
      try {
        fetch('/api/report-devtools', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch (e) {}
      try {
        router.replace('/menu');
      } catch (e) {
        try {
          document.documentElement.innerHTML =
            '<h1 style="color:white;background-color:black;height:100vh;display:flex;align-items:center;justify-content:center;margin:0">Session blocked</h1>';
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
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
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
      // intentionally triggers the getter
      // eslint-disable-next-line no-console
      console.log(detector);

      const detected = viewportDetected || consoleDetected;

      if (detected) {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
        try {
          document.removeEventListener('cut', preventClipboardActions);
          document.removeEventListener('copy', preventClipboardActions);
          document.removeEventListener('paste', preventClipboardActions);
          document.removeEventListener('contextmenu', preventContextMenu);
          document.removeEventListener('keydown', onKeyDown);
        } catch (e) {}
        reportDevtoolsAndRedirect();
      }
    }, 350);

    return () => {
      try {
        if (intervalId !== undefined) clearInterval(intervalId);
        document.removeEventListener('cut', preventClipboardActions);
        document.removeEventListener('copy', preventClipboardActions);
        document.removeEventListener('paste', preventClipboardActions);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', onKeyDown);
      } catch (e) {}
    };
  }, [router]);

  useEffect(() => {
    // Resolve embed result (supports sync return or Promise)
    setLoading(true);
    let isMounted = true;

    try {
      const result = mediaType === 'movie'
        ? getMovieEmbed(mediaId)
        : getTVEmbed(mediaId, season, episode);

      Promise.resolve(result)
        .then((res: any) => {
          if (!isMounted) return;
          const url = res?.embedUrl ?? '';
          setEmbedUrl(url);
          const displayInfo = mediaType === 'tv' ? `S${season}E${episode}` : 'Movie';
          console.log(`${mediaType} embed: ${displayInfo} - ${url}`);
        })
        .catch((err) => {
          console.error('Failed to get embed result', err);
          if (!isMounted) return;
          setEmbedUrl('');
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } catch (err) {
      console.error('Error while resolving embed', err);
      if (isMounted) {
        setEmbedUrl('');
        setLoading(false);
      }
    }

    return () => { isMounted = false; };
  }, [mediaId, mediaType, season, episode]);

  const handleClose = () => onClose ? onClose() : router.back();

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

      {/* Only render back button (no title) */}
      {showBackButton && (
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



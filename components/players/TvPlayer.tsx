'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getTVEmbed } from '@/lib/api/video-tv';

interface TvPlayerProps {
  mediaId: number | string;
  season: number;
  episode: number;
  title?: string;
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
  guardMs,
  autoNextMs,
  showControls
}: TvPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // DevTools protection (same as before)
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
      console.log(detector);

      const detected = viewportDetected || consoleDetected;

      if (detected) {
        if (intervalId) {
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
        if (intervalId) clearInterval(intervalId);
        document.removeEventListener('cut', preventClipboardActions);
        document.removeEventListener('copy', preventClipboardActions);
        document.removeEventListener('paste', preventClipboardActions);
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', onKeyDown);
      } catch (e) {}
    };
  }, [router]);

  useEffect(() => {
    // ✅ FIXED: Use actual season and episode parameters
    const result = getTVEmbed(mediaId, season, episode);
    setEmbedUrl(result.embedUrl);
    setLoading(false);
    
    console.log(`TV embed: S${season}E${episode} - ${result.embedUrl}`);
  }, [mediaId, season, episode]); // Re-run when season/episode changes

  const handleClose = () => onClose ? onClose() : router.back();

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
      
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {title && (
          <h1 className="text-white font-bold text-lg">
            {title} - S{season}E{episode}
          </h1>
        )}
      </div>
    </div>
  );
}


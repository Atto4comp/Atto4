'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  title,
  onClose
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // ---------- DevTools detection + input blocking (runs only on this page) ----------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // --- Helper actions ---
    function reportDevtoolsAndRedirect() {
      try {
        // Notify server to revoke session / tokens (best-effort)
        fetch('/api/report-devtools', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch (e) {
        // ignore
      }

      // Redirect the user to menu page immediately
      try {
        router.replace('/menu');
      } catch (e) {
        // fallback: wipe the page if router fails
        try {
          document.documentElement.innerHTML = '<h1 style="color:white;background-color:black;height:100vh;display:flex;align-items:center;justify-content:center;margin:0">Session blocked</h1>';
        } catch {}
      }
    }

    // --- Prevent cut/copy/paste and context menu ---
    function preventClipboardActions(e: Event) {
      e.preventDefault();
    }
    function preventContextMenu(e: Event) {
      e.preventDefault();
    }
    document.addEventListener('cut', preventClipboardActions);
    document.addEventListener('copy', preventClipboardActions);
    document.addEventListener('paste', preventClipboardActions);
    document.addEventListener('contextmenu', preventContextMenu);

    // --- Block common inspect key combos (Ctrl+U, Ctrl+Shift+I/J/C, F12) ---
    function onKeyDown(e: KeyboardEvent) {
      // block Ctrl+U
      if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // block Ctrl+Shift+I / J / C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // block F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    document.addEventListener('keydown', onKeyDown);

    // --- DevTools detection heuristics ---
    let intervalId: number | undefined;
    const threshold = 160;
    let consoleDetected = false;

    // console getter trick object
    const detector = new Image();
    Object.defineProperty(detector, 'id', {
      get() {
        consoleDetected = true;
        return '';
      },
    });

    intervalId = window.setInterval(() => {
      // viewport heuristic
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const viewportDetected = widthDiff > threshold || heightDiff > threshold;

      // console getter detection
      consoleDetected = false;
      // eslint-disable-next-line no-console
      console.log(detector);

      const detected = viewportDetected || consoleDetected;

      if (detected) {
        // Clear listeners quickly to avoid double actions
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = undefined;
        }
        // Clean up DOM listeners before redirecting
        try {
          document.removeEventListener('cut', preventClipboardActions);
          document.removeEventListener('copy', preventClipboardActions);
          document.removeEventListener('paste', preventClipboardActions);
          document.removeEventListener('contextmenu', preventContextMenu);
          document.removeEventListener('keydown', onKeyDown);
        } catch (e) {}
        // Report and redirect to /menu
        reportDevtoolsAndRedirect();
      }
    }, 350);

    // cleanup on unmount
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
  // -----------------------------------------------------------------

  useEffect(() => {
    // ✅ INSTANT: No async calls, no validation delays
    let result;
    if (mediaType === 'movie') {
      result = getMovieEmbed(mediaId);
    } else {
      result = getTVEmbed(mediaId);
    }
    
    setEmbedUrl(result.embedUrl);
    setLoading(false);
    
    console.log(`${mediaType} embed: ${result.embedUrl}`);
  }, [mediaId, mediaType]);

  const handleClose = () => onClose ? onClose() : router.back();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          <h1 className="text-white font-bold text-lg">{title}</h1>
        )}
      </div>
    </div>
  );
}

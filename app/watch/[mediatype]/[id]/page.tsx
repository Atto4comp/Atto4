// app/watch/[mediatype]/[id]/page.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';
import { tmdbApi } from '@/lib/api/tmdb';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mediaType = params?.mediatype as 'movie' | 'tv';
  const id = parseInt(params?.id as string, 10);

  // Get season and episode from query params for TV shows (default to 1)
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

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
    // Hide body scroll for fullscreen experience
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow || 'auto';
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMediaData() {
      setLoading(true);
      try {
        let data = null;
        if (mediaType === 'movie') {
          data = await tmdbApi.getMovieDetails(id);
        } else if (mediaType === 'tv') {
          data = await tmdbApi.getTVShowDetails(id);
        }

        if (!cancelled) setMediaData(data);
      } catch (error) {
        console.error('Failed to load media:', error);
        if (!cancelled) setMediaData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id && (mediaType === 'movie' || mediaType === 'tv')) {
      loadMediaData();
    } else {
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [id, mediaType]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!mediaData && (mediaType === 'movie' || mediaType === 'tv')) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4">Media not found</h1>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Determine a display title (movie.title or tv.name)
  const title = mediaData?.title ?? mediaData?.name ?? '';

  // Render correct player
  if (mediaType === 'movie') {
    return (
      <MoviePlayer
        mediaId={id}
        title={title}
        onClose={handleClose}
        // optional tuning:
        guardMs={6000}
        showControls={true}
      />
    );
  }

  if (mediaType === 'tv') {
    return (
      <TvPlayer
        mediaId={id}
        season={season}
        episode={episode}
        title={title}
        onClose={handleClose}
        // optional tuning values — tweak as desired:
        guardMs={5000}
        autoNextMs={25 * 60 * 1000} // auto-advance after ~25 minutes (optional)
        showControls={true}
      />
    );
  }

  // Fallback for unknown mediatype
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">Unsupported media type</h1>
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

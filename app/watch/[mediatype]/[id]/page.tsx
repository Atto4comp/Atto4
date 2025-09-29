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

  // ---------- DevTools detection (runs only on this page) ----------
  useEffect(() => {
    // Safety: only run in browser
    if (typeof window === 'undefined') return;

    let wasOpen = false;
    const threshold = 160;
    let intervalId: number | undefined;

    // console getter trick
    const detector = new Image();
    Object.defineProperty(detector, 'id', {
      get: function () {
        wasOpen = true;
        return '';
      },
    });

    function reportAndBlock() {
      try {
        // best-effort report to server to let backend revoke tokens/session
        fetch('/api/report-devtools', { method: 'POST', credentials: 'include' }).catch(() => {});
      } catch (e) {
        // ignore
      }
      // wipe page content immediately
      try {
        document.documentElement.innerHTML = '<h1 style="color:white;background-color:black;height:100vh;display:flex;align-items:center;justify-content:center;margin:0">Session blocked</h1>';
      } catch (e) {
        // fallback: navigate back
        try { router.back(); } catch {}
      }
    }

    intervalId = window.setInterval(() => {
      // viewport heuristic
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const viewportDetected = widthDiff > threshold || heightDiff > threshold;

      // console getter detection (logs detector - getter runs if console open)
      wasOpen = false;
      // eslint-disable-next-line no-console
      console.log(detector);

      const detected = viewportDetected || wasOpen;

      if (detected) {
        reportAndBlock();
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    }, 400);

    return () => {
      if (intervalId) clearInterval(intervalId);
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


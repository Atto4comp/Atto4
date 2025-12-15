'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';

interface LatestReleasesClientProps {
  initialMovieGenres: any[];
  initialTVGenres: any[];
  initialItems: any[];
  initialTotalPages: number;
}

export default function LatestReleasesClient({
  initialMovieGenres,
  initialTVGenres,
  initialItems,
  initialTotalPages,
}: LatestReleasesClientProps) {
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie');
  const [genreId, setGenreId] = useState<number | undefined>();
  const [genres, setGenres] = useState(initialMovieGenres);

  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);

  /* ---------------- FETCH ---------------- */

  const fetchData = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        const data = await tmdbApi.getLatestReleases(mediaType, pageNum, genreId);
        if (!data?.results) return;

        setItems(prev =>
          reset ? data.results : [...prev, ...data.results]
        );

        setHasMore(pageNum < (data.total_pages || 1));
      } catch (err) {
        console.error('Latest releases fetch error:', err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [mediaType, genreId, loading]
  );

  /* ---------------- RESET ---------------- */

  const resetAndFetch = useCallback(async () => {
    observer.current?.disconnect();
    setItems([]);
    setPage(1);
    setHasMore(true);
    await fetchData(1, true);
  }, [fetchData]);

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    setGenres(mediaType === 'movie' ? initialMovieGenres : initialTVGenres);
    resetAndFetch();
  }, [mediaType, genreId]);

  /* ---------------- INFINITE SCROLL ---------------- */

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || !hasMore) return;

      observer.current?.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          const next = page + 1;
          setPage(next);
          fetchData(next);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, fetchData]
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
        <Calendar className="w-7 h-7 text-blue-500" />
        Latest Releases
      </h1>

      <p className="text-gray-400 mb-6">
        Recently released {mediaType === 'movie' ? 'movies' : 'TV shows'}
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={mediaType}
          onChange={e => setMediaType(e.target.value as any)}
          className="bg-gray-900 border border-gray-700 px-4 py-2 rounded"
        >
          <option value="movie">Movies</option>
          <option value="tv">TV Shows</option>
        </select>

        <select
          value={genreId || ''}
          onChange={e =>
            setGenreId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="bg-gray-900 border border-gray-700 px-4 py-2 rounded"
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <MediaGrid
        items={items}
        mediaType={mediaType}
        loading={loading && page === 1}
      />

      <div ref={lastItemRef} className="h-16" />

      {!hasMore && items.length > 0 && (
        <p className="text-center text-gray-500 mt-10">
          🎬 You’ve reached the end
        </p>
      )}
    </div>
  );
}

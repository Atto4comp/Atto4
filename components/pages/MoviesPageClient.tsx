'use client';

import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';

interface MoviesPageClientProps {
  initialGenres: any[];
  initialMovies: any[];
  initialTotalPages: number;
}

export default function MoviesPageClient({
  initialGenres,
  initialMovies,
  initialTotalPages,
}: MoviesPageClientProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [genres] = useState(initialGenres);

  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'popular' | 'now_playing' | 'latest' | 'top_rated'>('popular');

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);

  /* ----------------------------------------
     FETCH LOGIC (single source of truth)
  ---------------------------------------- */
  const fetchMovies = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        let data;

        // ✅ Genre has priority
        if (selectedGenre) {
          data = await tmdbApi.getMoviesByGenre(Number(selectedGenre), pageNum);
        } else {
          switch (sortOrder) {
            case 'now_playing':
              data = await tmdbApi.getNowPlayingMovies(pageNum);
              break;
            case 'latest':
              data = await tmdbApi.getUpcomingMovies(pageNum);
              break;
            case 'top_rated':
              data = await tmdbApi.getTopRatedMovies(pageNum);
              break;
            default:
              data = await tmdbApi.getPopularMovies(pageNum);
          }
        }

        if (!data?.results) return;

        setMovies(prev =>
          reset ? data.results : [...prev, ...data.results]
        );

        setHasMore(pageNum < data.total_pages);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedGenre, sortOrder, loading]
  );

  /* ----------------------------------------
     RESET + FETCH (filters change)
  ---------------------------------------- */
  const resetAndFetch = useCallback(async () => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    await fetchMovies(1, true);
  }, [fetchMovies]);

  useEffect(() => {
    resetAndFetch();
  }, [selectedGenre, sortOrder]);

  /* ----------------------------------------
     LOAD MORE
  ---------------------------------------- */
  const loadMore = async () => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetchMovies(next);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Movies</h1>
        <p className="text-gray-400">Discover movies across genres & trends</p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <select
          value={selectedGenre}
          onChange={e => setSelectedGenre(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
        >
          <option value="">All Genres</option>
          {genres.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={e => {
            setSortOrder(e.target.value as any);
            setSelectedGenre(''); // ✅ prevent conflicts
          }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
        >
          <option value="popular">Popular</option>
          <option value="now_playing">Now Playing</option>
          <option value="latest">Upcoming</option>
          <option value="top_rated">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      <MediaGrid
        items={movies}
        mediaType="movie"
        loading={loading && page === 1}
      />

      {/* Load More */}
      {hasMore && movies.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="bg-white text-black font-semibold py-3 px-8 rounded-full"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      {!hasMore && movies.length > 0 && (
        <p className="text-center text-gray-500 mt-10">
          ✨ You’ve reached the end
        </p>
      )}
    </div>
  );
}

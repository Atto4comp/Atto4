'use client';

import { useState, useEffect, useCallback } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';

interface TVShowsPageClientProps {
  initialGenres: any[];
  initialShows: any[];
  initialTotalPages: number;
}

export default function TVShowsPageClient({
  initialGenres,
  initialShows,
  initialTotalPages,
}: TVShowsPageClientProps) {
  const [shows, setShows] = useState(initialShows);
  const [genres] = useState(initialGenres);

  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'popular' | 'airing_today' | 'on_the_air' | 'top_rated'>('popular');

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);

  /* ----------------------------------------
     FETCH LOGIC
  ---------------------------------------- */
  const fetchShows = useCallback(
    async (pageNum: number, reset = false) => {
      if (loading) return;
      setLoading(true);

      try {
        let data;

        if (selectedGenre) {
          data = await tmdbApi.getTVShowsByGenre(Number(selectedGenre), pageNum);
        } else {
          switch (sortOrder) {
            case 'airing_today':
              data = await tmdbApi.getAiringTodayTVShows(pageNum);
              break;
            case 'on_the_air':
              data = await tmdbApi.getOnTheAirTVShows(pageNum);
              break;
            case 'top_rated':
              data = await tmdbApi.getTopRatedTVShows(pageNum);
              break;
            default:
              data = await tmdbApi.getPopularTVShows(pageNum);
          }
        }

        if (!data?.results) return;

        setShows(prev =>
          reset ? data.results : [...prev, ...data.results]
        );

        setHasMore(pageNum < data.total_pages);
      } catch (err) {
        console.error('Failed to fetch TV shows:', err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [selectedGenre, sortOrder, loading]
  );

  /* ----------------------------------------
     RESET ON FILTER CHANGE
  ---------------------------------------- */
  const resetAndFetch = useCallback(async () => {
    setShows([]);
    setPage(1);
    setHasMore(true);
    await fetchShows(1, true);
  }, [fetchShows]);

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
    await fetchShows(next);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold">TV Shows</h1>
        <p className="text-gray-400">Explore trending & top-rated series</p>
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
            setSelectedGenre('');
          }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3"
        >
          <option value="popular">Popular</option>
          <option value="airing_today">Airing Today</option>
          <option value="on_the_air">On The Air</option>
          <option value="top_rated">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      <MediaGrid
        items={shows}
        mediaType="tv"
        loading={loading && page === 1}
      />

      {/* Load More */}
      {hasMore && shows.length > 0 && (
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

      {!hasMore && shows.length > 0 && (
        <p className="text-center text-gray-500 mt-10">
          ✨ You’ve reached the end
        </p>
      )}
    </div>
  );
}

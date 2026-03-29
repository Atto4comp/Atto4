'use client';

import { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';
import { Filter, ChevronDown, SortAsc, Sparkles } from 'lucide-react';

interface TVShowsPageClientProps {
  initialGenres: any[];
  initialShows: any[];
  initialTotalPages: number;
}

export default function TVShowsPageClient({ 
  initialGenres, 
  initialShows,
  initialTotalPages 
}: TVShowsPageClientProps) {
  const [tvShows, setTvShows] = useState(initialShows);
  const [genres] = useState(initialGenres);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortOrder, setSortOrder] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(initialTotalPages > 1);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);
      setTvShows([]); 
      setCurrentPage(1);

      try {
        let data;
        if (selectedGenre) {
          data = await tmdbApi.getTVShowsByGenre(parseInt(selectedGenre), 1);
        } else {
          switch (sortOrder) {
            case 'airing_today': data = await tmdbApi.getAiringTodayTVShows(1); break;
            case 'on_the_air': data = await tmdbApi.getOnTheAirTVShows(1); break;
            case 'top_rated': data = await tmdbApi.getTopRatedTVShows(1); break;
            default: data = await tmdbApi.getPopularTVShows(1);
          }
        }

        if (controller.signal.aborted) return;

        setTvShows(data?.results || []);
        setCanLoadMore(data?.total_pages > 1);

      } catch (error: any) {
        if (error.name !== 'AbortError') console.error('Failed to fetch TV shows:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [selectedGenre, sortOrder]);

  const loadMoreShows = async () => {
    if (isLoading || !canLoadMore) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;
    
    try {
      let data;
      if (selectedGenre) {
        data = await tmdbApi.getTVShowsByGenre(parseInt(selectedGenre), nextPage);
      } else {
        switch (sortOrder) {
          case 'airing_today': data = await tmdbApi.getAiringTodayTVShows(nextPage); break;
          case 'on_the_air': data = await tmdbApi.getOnTheAirTVShows(nextPage); break;
          case 'top_rated': data = await tmdbApi.getTopRatedTVShows(nextPage); break;
          default: data = await tmdbApi.getPopularTVShows(nextPage);
        }
      }

      if (data?.results?.length) {
        setTvShows(prev => [...prev, ...data.results]);
        setCurrentPage(nextPage);
        setCanLoadMore(nextPage < data.total_pages);
      } else {
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error('Failed to load more shows:', error);
      setCanLoadMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 pt-28 -mt-20 selection:bg-[var(--accent-muted)]">

      {/* Page Header */}
      <header className="section-shell relative mb-10 flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[var(--accent)]/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-white">
          TV Shows
        </h1>
        <p className="text-white/40 text-base md:text-lg mt-3 max-w-xl leading-relaxed">
          Binge-worthy series, trending documentaries, and daily episodes.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="section-shell mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 justify-center w-full md:w-auto">
          {/* Genre Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/28 group-hover:text-white/48 transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-white/72 focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]/30 outline-none transition-all cursor-pointer min-w-[180px]"
            >
              <option value="">All Genres</option>
              {genres.map((genre: any) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/24">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/28 group-hover:text-white/48 transition-colors">
              <SortAsc className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setSelectedGenre(''); 
              }}
              disabled={!!selectedGenre}
              className="appearance-none bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-white/72 focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]/30 outline-none transition-all cursor-pointer min-w-[160px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="popular">Popular</option>
              <option value="airing_today">Airing Today</option>
              <option value="on_the_air">On The Air</option>
              <option value="top_rated">Top Rated</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/24">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {tvShows.length > 0 && !isLoading && (
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-semibold text-white/28 uppercase tracking-[0.16em] px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            <span>{tvShows.length} Series</span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="section-shell min-h-[500px]">
        <MediaGrid items={tvShows} mediaType="tv" loading={isLoading && currentPage === 1} />

        {tvShows.length > 0 && canLoadMore && (
          <div className="mt-16 text-center">
            <button
              onClick={loadMoreShows}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-[14px] font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Loading…</span>
                </div>
              ) : (
                <span>Load More</span>
              )}
            </button>
          </div>
        )}

        {!canLoadMore && tvShows.length > 0 && (
          <div className="mt-16 text-center border-t border-white/[0.04] pt-8">
            <p className="text-white/24 text-[12px] uppercase tracking-[0.14em]">End of collection</p>
          </div>
        )}

        {!isLoading && tvShows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
              <span className="text-2xl opacity-40">📺</span>
            </div>
            <h3 className="font-display text-lg font-semibold text-white mb-1">No TV shows found</h3>
            <p className="text-white/36 text-sm max-w-md">
              Try adjusting your filters or browse a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

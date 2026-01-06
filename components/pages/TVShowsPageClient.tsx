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

      } catch (error) {
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
    // ✅ FIXED: Added negative margin (-mt-24) to pull background up over the layout gap
    // ✅ ADJUSTED: Increased padding (pt-32)
    <div className="min-h-screen bg-[#09090b] pb-24 pt-32 -mt-24 px-6 md:px-12 selection:bg-purple-500/30 relative z-0">
      
      <header className="relative mb-12 max-w-[1800px] mx-auto flex flex-col items-center text-center">
        {/* Glow Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white font-chillax">
          TV Shows
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
          Binge-worthy series, trending documentaries, and daily episodes.
        </p>
      </header>

      {/* Filter Bar */}
      <div className="max-w-[1800px] mx-auto mb-10 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-28 z-30 transition-all">
        
        <div className="flex flex-wrap gap-4 justify-center w-full md:w-auto">
          {/* Genre Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-[#0F0F0F] hover:bg-[#161616] border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all cursor-pointer min-w-[200px] shadow-lg shadow-black/20"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-hover:text-white transition-colors">
              <SortAsc className="w-4 h-4" />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setSelectedGenre(''); 
              }}
              disabled={!!selectedGenre}
              className="appearance-none bg-[#0F0F0F] hover:bg-[#161616] border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all cursor-pointer min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
            >
              <option value="popular">Popular</option>
              <option value="airing_today">Airing Today</option>
              <option value="on_the_air">On The Air</option>
              <option value="top_rated">Top Rated</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {tvShows.length > 0 && !isLoading && (
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>{tvShows.length} Series</span>
          </div>
        )}
      </div>

      <div className="max-w-[1800px] mx-auto min-h-[500px]">
        <MediaGrid items={tvShows} mediaType="tv" loading={isLoading && currentPage === 1} />

        {tvShows.length > 0 && canLoadMore && (
          <div className="mt-24 text-center">
            <button
              onClick={loadMoreShows}
              disabled={isLoading}
              className="group relative bg-white text-black font-bold py-4 px-12 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <span>Load More Shows</span>
              )}
            </button>
          </div>
        )}

        {!canLoadMore && tvShows.length > 0 && (
          <div className="mt-24 text-center border-t border-white/5 pt-12">
            <p className="text-gray-500 text-sm font-light tracking-wide">You've reached the end of the collection.</p>
          </div>
        )}

        {!isLoading && tvShows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
              <span className="text-4xl opacity-50">📺</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No TV shows found</h3>
            <p className="text-gray-500 max-w-md font-light">
              We couldn't find any shows matching your filters. Try adjusting your selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

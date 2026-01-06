'use client';

import { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';
import { Filter, ChevronDown, SortAsc, Sparkles } from 'lucide-react';

interface MovieItem {
  id: number;
  title?: string;
  name?: string; 
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
}

interface MoviesPageClientProps {
  initialGenres: { id: number; name: string }[];
  initialMovies: MovieItem[];
  initialTotalPages: number;
}

export default function MoviesPageClient({ 
  initialGenres, 
  initialMovies,
  initialTotalPages 
}: MoviesPageClientProps) {
  const [movies, setMovies] = useState<MovieItem[]>(initialMovies);
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
      setMovies([]); 
      setCurrentPage(1);
      
      try {
        let data;
        if (selectedGenre) {
          data = await tmdbApi.getMoviesByGenre(parseInt(selectedGenre), 1);
        } else {
          switch (sortOrder) {
            case 'latest': data = await tmdbApi.getUpcomingMovies(1); break;
            case 'top_rated': data = await tmdbApi.getTopRatedMovies(1); break;
            case 'now_playing': data = await tmdbApi.getNowPlayingMovies(1); break;
            default: data = await tmdbApi.getPopularMovies(1);
          }
        }

        if (controller.signal.aborted) return;

        setMovies(data?.results || []);
        setCanLoadMore(data?.total_pages > 1);

      } catch (error: any) {
        if (error.name !== 'AbortError') console.error('Failed to fetch movies:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [selectedGenre, sortOrder]); 

  const loadMoreMovies = async () => {
    if (isLoading || !canLoadMore) return;
    setIsLoading(true);
    const nextPage = currentPage + 1;
    
    try {
      let data;
      if (selectedGenre) {
        data = await tmdbApi.getMoviesByGenre(parseInt(selectedGenre), nextPage);
      } else {
        switch (sortOrder) {
          case 'latest': data = await tmdbApi.getUpcomingMovies(nextPage); break;
          case 'top_rated': data = await tmdbApi.getTopRatedMovies(nextPage); break;
          case 'now_playing': data = await tmdbApi.getNowPlayingMovies(nextPage); break;
          default: data = await tmdbApi.getPopularMovies(nextPage);
        }
      }

      if (data?.results?.length) {
        setMovies(prev => [...prev, ...data.results]);
        setCurrentPage(nextPage);
        setCanLoadMore(nextPage < data.total_pages);
      } else {
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error('Failed to load more movies:', error);
      setCanLoadMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ BG: Rich dark charcoal (#09090b) - Modern & Clean
    <div className="min-h-screen bg-[#09090b] pb-24 pt-32 px-6 md:px-12 selection:bg-blue-500/30">
      
      {/* 
         ✨ Header: Minimalistic with subtle depth glow 
         - Removed "black shade" gradient
         - Added 'pointer-events-none' blurred orb for depth without clutter
      */}
      <header className="relative mb-16 max-w-[1800px] mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white font-chillax">
          Movies
        </h1>
        <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
          Curated cinema. From box office hits to hidden indie gems.
        </p>
      </header>

      {/* 
         🎛️ Filter Bar: Floating, Glassmorphic, No Box 
      */}
      <div className="max-w-[1800px] mx-auto mb-12 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-24 z-30 transition-all">
        
        <div className="flex flex-wrap gap-4 justify-center w-full md:w-auto">
          
          {/* Genre Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </div>
            {/* ✅ Dropdown: Dark (#0F0F0F) with refined borders */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-[#0F0F0F] hover:bg-[#161616] border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all cursor-pointer min-w-[200px] shadow-lg shadow-black/20"
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
              className="appearance-none bg-[#0F0F0F] hover:bg-[#161616] border border-white/10 rounded-full pl-11 pr-12 py-3.5 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all cursor-pointer min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
            >
              <option value="popular">Popular</option>
              <option value="now_playing">Now Playing</option>
              <option value="latest">Upcoming</option>
              <option value="top_rated">Top Rated</option>
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Results Counter (Subtle Pill) */}
        {movies.length > 0 && !isLoading && (
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>{movies.length} Titles</span>
          </div>
        )}
      </div>

      {/* Grid Content */}
      <div className="max-w-[1800px] mx-auto min-h-[500px]">
        <MediaGrid 
          items={movies as any} 
          mediaType="movie" 
          loading={isLoading && currentPage === 1} 
        />

        {movies.length > 0 && canLoadMore && (
          <div className="mt-24 text-center">
            <button
              onClick={loadMoreMovies}
              disabled={isLoading}
              className="group relative bg-white text-black font-bold py-4 px-12 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <span>Load More Movies</span>
              )}
            </button>
          </div>
        )}

        {!canLoadMore && movies.length > 0 && (
          <div className="mt-24 text-center border-t border-white/5 pt-12">
            <p className="text-gray-500 text-sm font-light tracking-wide">You've reached the end of the collection.</p>
          </div>
        )}

        {!isLoading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
              <span className="text-4xl opacity-50">🎬</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
            <p className="text-gray-500 max-w-md font-light">
              We couldn't find any movies matching your filters. Try adjusting your selection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';
import { Filter, ChevronDown, SortAsc } from 'lucide-react';

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
    // ✅ Updated Background: Darker #050505
    <div className="min-h-screen bg-[#050505] pb-20 pt-24 px-6 md:px-12">
      
      {/* Header Section with Glow */}
      <header className="relative mb-12 max-w-7xl mx-auto">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white font-chillax relative z-10">
          Movies
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl relative z-10">
          Explore a vast library of blockbusters, indie gems, and timeless cinema classics in stunning quality.
        </p>
      </header>

      {/* Modern Filter Bar */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Genre Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all hover:bg-white/5 cursor-pointer min-w-[200px]"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <SortAsc className="w-4 h-4" />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setSelectedGenre(''); 
              }}
              disabled={!!selectedGenre} 
              className="appearance-none bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all hover:bg-white/5 cursor-pointer min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="popular">Popular</option>
              <option value="now_playing">Now Playing</option>
              <option value="latest">Upcoming</option>
              <option value="top_rated">Top Rated</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {movies.length > 0 && !isLoading && (
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            {movies.length} Results
          </span>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <MediaGrid 
          items={movies as any} 
          mediaType="movie" 
          loading={isLoading && currentPage === 1} 
        />

        {movies.length > 0 && canLoadMore && (
          <div className="mt-16 text-center">
            <button
              onClick={loadMoreMovies}
              disabled={isLoading}
              className="group relative bg-white text-black font-bold py-4 px-12 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
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
          <div className="mt-16 text-center border-t border-white/5 pt-8">
            <p className="text-gray-500 text-sm">You've reached the end of the list.</p>
          </div>
        )}

        {!isLoading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🎬</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
            <p className="text-gray-400 max-w-md">
              We couldn't find any movies matching your filters. Try adjusting your selection or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

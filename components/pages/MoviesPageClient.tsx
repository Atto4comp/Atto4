'use client';

import { useState, useEffect, useRef } from 'react';
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
  initialTotalPages 
}: MoviesPageClientProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [genres] = useState(initialGenres);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortOrder, setSortOrder] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(initialTotalPages > 1);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // This effect handles ALL filter changes (Genre or Sort)
  useEffect(() => {
    const fetchData = async () => {
      // 1. Abort previous fetch
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 2. Reset State Visuals
      setIsLoading(true);
      setMovies([]); // Clear to prevent mismatch visuals
      setCurrentPage(1);
      
      try {
        let data;
        // 3. Fetch based on CURRENT state variables
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

      } catch (error) {
        if (error.name !== 'AbortError') console.error('Failed to fetch movies:', error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchData();
    
    return () => abortControllerRef.current?.abort();
  }, [selectedGenre, sortOrder]); // Trigger whenever these change

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
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Movies</h1>
        <p className="text-gray-400 text-base">
          Discover blockbusters, indie films and cinema classics
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">Filter by Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white min-w-[180px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-300">Sort By</label>
          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setSelectedGenre(''); // Optional: Clear genre when sorting changes if desired, else remove this line
            }}
            disabled={!!selectedGenre} // Optional: Disable sort if specific genre selected (TMDB limitation usually)
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="popular">Popular</option>
            <option value="now_playing">Now Playing</option>
            <option value="latest">Upcoming</option>
            <option value="top_rated">Top Rated</option>
          </select>
        </div>
      </div>

      {movies.length > 0 && !isLoading && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm">{movies.length} movies found</p>
        </div>
      )}

      <MediaGrid items={movies} mediaType="movie" loading={isLoading && currentPage === 1} />

      {movies.length > 0 && canLoadMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMoreMovies}
            disabled={isLoading}
            className="group relative bg-white text-black font-semibold py-4 px-10 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                <span>Loading more...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Show More</span>
              </div>
            )}
          </button>
        </div>
      )}

      {!canLoadMore && movies.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">✨ You've seen all available movies</p>
        </div>
      )}

      {!isLoading && movies.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">No movies found</h3>
          <p className="text-gray-400">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  );
}

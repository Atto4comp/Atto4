// components/pages/BrowsePageClient.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Grid, List, Loader2, Star, Eye } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';

interface BrowsePageClientProps {
  category: string;
  defaultMediaType: 'movie' | 'tv';
  initialGenres: any[];
  initialItems: any[];
  initialTotalPages: number;
}

// ✅ TMDB Image constants
const TMDB_IMAGE_SIZES = {
  poster: 'w500',
  posterSmall: 'w342',
} as const;

export default function BrowsePageClient({
  category,
  defaultMediaType,
  initialGenres,
  initialItems,
  initialTotalPages,
}: BrowsePageClientProps) {
  const router = useRouter();
  
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(defaultMediaType);
  const [genreId, setGenreId] = useState<number | undefined>(undefined);
  const [genres, setGenres] = useState(initialGenres);
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const observer = useRef<IntersectionObserver | null>(null);

  // ✅ Build TMDB image URLs
  const buildTmdbImage = (path: string | null, size: string = 'w500'): string => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  // Remove duplicates
  const removeDuplicates = (itemsArray: any[]) => {
    const seen = new Set();
    return itemsArray.filter(item => {
      const key = `${item.media_type || mediaType}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Fetch genres when media type changes
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = mediaType === 'movie' 
          ? await tmdbApi.getMovieGenres()
          : await tmdbApi.getTVGenres();
        setGenres(genreData);
      } catch (error) {
        setGenres([]);
      }
    };
    
    if (mediaType !== defaultMediaType) {
      fetchGenres();
    }
  }, [mediaType, defaultMediaType]);

  // Get category display name
  const getCategoryTitle = (cat: string, type: string) => {
    const titles: Record<string, string> = {
      'trending': type === 'movie' ? 'Trending Movies' : 'Trending TV Shows',
      'popular': type === 'movie' ? 'Popular Movies' : 'Popular TV Shows',
      'top-rated': type === 'movie' ? 'Top Rated Movies' : 'Top Rated TV Shows',
      'upcoming': 'Upcoming Movies',
      'now-playing': 'Now Playing Movies',
      'on-the-air': 'On The Air TV Shows',
      'airing-today': 'Airing Today TV Shows',
      'latest': type === 'movie' ? 'Latest Movie Releases' : 'Latest TV Show Releases'
    };
    return titles[cat] || cat.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Fetch data function
  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Use the same fetchCategoryData logic from server
      let data;
      
      if (mediaType === 'tv') {
        switch (category) {
          case 'popular':
            data = await tmdbApi.getTVByCategory('popular', pageNum);
            break;
          case 'top-rated':
            data = await tmdbApi.getTVByCategory('top-rated', pageNum);
            break;
          case 'on-the-air':
            data = await tmdbApi.getTVByCategory('on-the-air', pageNum);
            break;
          case 'airing-today':
            data = await tmdbApi.getTVByCategory('airing-today', pageNum);
            break;
          case 'latest':
            data = await tmdbApi.getLatestReleases('tv', pageNum, genreId);
            break;
          default:
            data = await tmdbApi.discoverTVShows({ page: pageNum, genreId });
        }
      } else {
        switch (category) {
          case 'popular':
            data = await tmdbApi.getPopularMovies(pageNum);
            break;
          case 'top-rated':
            data = await tmdbApi.getTopRatedMovies(pageNum);
            break;
          case 'upcoming':
            data = await tmdbApi.getUpcomingMovies(pageNum);
            break;
          case 'now-playing':
            data = await tmdbApi.getNowPlayingMovies(pageNum);
            break;
          case 'latest':
            data = await tmdbApi.getLatestReleases('movie', pageNum, genreId);
            break;
          default:
            data = await tmdbApi.getPopularMovies(pageNum);
        }
      }

      if (data?.results) {
        let results = data.results.filter(item => 
          item.poster_path && item.popularity > 0
        );

        // Apply sorting
        if (sortBy === 'rating') {
          results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        } else if (sortBy === 'release_date') {
          results.sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date || '1900-01-01');
            const dateB = new Date(b.release_date || b.first_air_date || '1900-01-01');
            return dateB.getTime() - dateA.getTime();
          });
        }

        if (reset) {
          setItems(results);
        } else {
          setItems(prev => removeDuplicates([...prev, ...results]));
        }
        
        setHasMore(pageNum < (data.total_pages || 1) && results.length > 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [category, mediaType, sortBy, genreId, loading]);

  // Reset data when filters change
  useEffect(() => {
    if (mediaType !== defaultMediaType || genreId || sortBy !== 'popularity') {
      setItems([]);
      setPage(1);
      setHasMore(true);
      fetchData(1, true);
    }
  }, [mediaType, sortBy, genreId, defaultMediaType, fetchData]);

  // Load more data
  useEffect(() => {
    if (page > 1) {
      fetchData(page);
    }
  }, [page, fetchData]);

  // Infinite scroll
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold">
              {getCategoryTitle(category, mediaType)}
            </h1>
            <p className="text-gray-400 mt-1">
              Discover the best {mediaType === 'movie' ? 'movies' : 'TV shows'}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-600 transition-colors`}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-800'} hover:bg-blue-600 transition-colors`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-gray-900/50 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Media Type:</span>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Genre:</span>
            <select
              value={genreId || ''}
              onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="release_date">Latest Release</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{items.length} results</span>
        </div>
      </div>

      {/* Content Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {items.map((item, index) => {
            const isMovie = mediaType === 'movie';
            const title = isMovie ? item.title : item.name;
            const releaseDate = isMovie ? item.release_date : item.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

            return (
              <div
                key={`${mediaType}-${item.id}`}
                ref={index === items.length - 1 ? lastItemRef : null}
              >
                <Link
                  href={`/${mediaType}/${item.id}`}
                  className="group block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src={buildTmdbImage(item.poster_path, TMDB_IMAGE_SIZES.poster)}
                      alt={title || 'Poster'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                    />
                    
                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {year || 'TBA'}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-400">Loading more...</span>
        </div>
      )}

      {/* No More Results */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">You've reached the end! 🎬</p>
        </div>
      )}

      {/* No Results */}
      {!loading && items.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
          <p className="text-gray-400">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

// components/pages/BrowsePageClient.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Grid, List, Loader2, Eye } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid'; // Using the robust grid we built

interface BrowsePageClientProps {
  category: string;
  defaultMediaType: 'movie' | 'tv';
  initialGenres: any[];
  initialItems: any[];
  initialTotalPages: number;
}

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
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const [sortBy, setSortBy] = useState('popularity');
  const observer = useRef<IntersectionObserver | null>(null);

  // Helper to deduplicate items
  const removeDuplicates = (itemsArray: any[]) => {
    const seen = new Set();
    return itemsArray.filter(item => {
      const key = `${item.media_type || mediaType}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

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
    return titles[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      let data;
      // Reusing logic from your snippet but ensuring consistent types
      if (mediaType === 'tv') {
        if (category === 'popular') data = await tmdbApi.getTVByCategory('popular', pageNum);
        else if (category === 'top-rated') data = await tmdbApi.getTVByCategory('top-rated', pageNum);
        else if (category === 'on-the-air') data = await tmdbApi.getTVByCategory('on-the-air', pageNum);
        else if (category === 'airing-today') data = await tmdbApi.getTVByCategory('airing-today', pageNum);
        else if (category === 'latest') data = await tmdbApi.getLatestReleases('tv', pageNum, genreId);
        else data = await tmdbApi.discoverTVShows({ page: pageNum, genreId });
      } else {
        if (category === 'popular') data = await tmdbApi.getPopularMovies(pageNum);
        else if (category === 'top-rated') data = await tmdbApi.getTopRatedMovies(pageNum);
        else if (category === 'upcoming') data = await tmdbApi.getUpcomingMovies(pageNum);
        else if (category === 'now-playing') data = await tmdbApi.getNowPlayingMovies(pageNum);
        else if (category === 'latest') data = await tmdbApi.getLatestReleases('movie', pageNum, genreId);
        else data = await tmdbApi.getPopularMovies(pageNum);
      }

      if (data?.results) {
        // Add media_type property if missing for safe key generation
        const results = data.results
          .filter((item: any) => item.poster_path) // Filter out items without posters
          .map((item: any) => ({ ...item, media_type: mediaType }));

        // Apply client-side sort if needed (API usually handles popularity)
        if (sortBy === 'rating') {
          results.sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));
        } else if (sortBy === 'release_date') {
          results.sort((a: any, b: any) => {
            const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
            const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
            return dateB - dateA;
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

  // Reset on filter change
  useEffect(() => {
    if (mediaType !== defaultMediaType || genreId || sortBy !== 'popularity') {
      setItems([]);
      setPage(1);
      setHasMore(true);
      fetchData(1, true);
    }
  }, [mediaType, sortBy, genreId, defaultMediaType, fetchData]);

  // Infinite Scroll Observer
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
        fetchData(page + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, fetchData]);

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4 md:px-8 pb-20">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-

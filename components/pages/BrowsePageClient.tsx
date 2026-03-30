'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { ArrowLeft, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';

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
  const searchParams = useSearchParams();
  
  // 1. Check URL for 'type' param (e.g., /browse/top-rated?type=tv)
  // If present, use it. Otherwise, fallback to defaultMediaType prop.
  const urlType = searchParams.get('type') as 'movie' | 'tv' | null;
  const initialType = urlType === 'movie' || urlType === 'tv' ? urlType : defaultMediaType;

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(initialType);
  const [genreId, setGenreId] = useState<number | undefined>(undefined);
  const [genres, setGenres] = useState(initialGenres);
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);
  const [sortBy, setSortBy] = useState('popularity');
  
  const observer = useRef<IntersectionObserver | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Helper to get display title
  const getCategoryTitle = (cat: string) => {
    return cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const removeDuplicates = (itemsArray: any[]) => {
    const seen = new Set();
    return itemsArray.filter(item => {
      const key = `${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const fetchData = useCallback(async (pageNum: number, isReset: boolean) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      if (isReset) setItems([]); 

      let data;

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

      if (controller.signal.aborted) return;

      if (data?.results) {
        const results = data.results.map((item: any) => ({ ...item, media_type: mediaType }));
        
        if (sortBy === 'rating') {
          results.sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));
        } else if (sortBy === 'release_date') {
          results.sort((a: any, b: any) => {
            const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
            const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
            return dateB - dateA;
          });
        }

        if (isReset) {
          setItems(results);
        } else {
          setItems(prev => removeDuplicates([...prev, ...results]));
        }
        
        setHasMore(pageNum < (data.total_pages || 1) && results.length > 0);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') console.error(error);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [category, mediaType, sortBy, genreId]);

  // Initial Fetch & Filter Change Handler
  useEffect(() => {
    // If it's the first render AND the initial props match our state (including URL override),
    // we MIGHT want to skip fetching if items are already populated.
    // BUT if the URL param forced a switch (e.g. props said movie, URL said tv),
    // we MUST fetch because initialItems are likely wrong (movies).
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // If the mediaType derived from URL differs from the prop default,
      // the initialItems passed from server (based on defaultMediaType) are WRONG.
      // We must refetch immediately.
      if (mediaType !== defaultMediaType) {
        setPage(1);
        setHasMore(true);
        fetchData(1, true);
      }
      return;
    }

    setPage(1);
    setHasMore(true);
    fetchData(1, true);
    
    return () => abortControllerRef.current?.abort();
  }, [mediaType, sortBy, genreId, fetchData, defaultMediaType]);

  // Update URL when mediaType changes (Optional but good UX)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', mediaType);
    // update URL without full reload
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [mediaType, router, searchParams]);

  // Update genres on media toggle
  useEffect(() => {
    let active = true;
    const loadGenres = async () => {
      const g = mediaType === 'movie' ? await tmdbApi.getMovieGenres() : await tmdbApi.getTVGenres();
      if (active) setGenres(g);
    };
    loadGenres();
    return () => { active = false; };
  }, [mediaType]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => {
            const nextPage = prev + 1;
            fetchData(nextPage, false);
            return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchData]);

  return (
    <div className="relative min-h-screen bg-black pb-24 pt-20 md:pb-20 md:pt-24">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
      </div>

      <div className="mx-auto max-w-[1800px] px-4 md:px-8">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <button 
              onClick={() => router.back()} 
              className="mb-4 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="font-chillax text-[2.4rem] font-bold text-white md:text-6xl">
              {getCategoryTitle(category)}
            </h1>
            <p className="mt-2 max-w-[24rem] text-sm text-white/60 md:text-lg">
              Discover the {mediaType === 'movie' ? 'movies' : 'TV shows'} everyone is watching.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'movie' | 'tv')}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/10 py-3 pl-4 pr-10 text-white outline-none transition-all hover:bg-white/20 focus:border-white/30"
              >
                <option value="movie" className="bg-black text-gray-300">Movies</option>
                <option value="tv" className="bg-black text-gray-300">TV Shows</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
              <select
                value={genreId || ''}
                onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : undefined)}
                className="min-w-[160px] w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/10 py-3 pl-10 pr-10 text-white outline-none transition-all hover:bg-white/20 focus:border-white/30"
              >
                <option value="" className="bg-black text-gray-300">All Genres</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id} className="bg-black text-gray-300">{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/10 py-3 pl-4 pr-10 text-white outline-none transition-all hover:bg-white/20 focus:border-white/30"
              >
                <option value="popularity" className="bg-black text-gray-300">Most Popular</option>
                <option value="rating" className="bg-black text-gray-300">Highest Rated</option>
                <option value="release_date" className="bg-black text-gray-300">Newest</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 
           Using your specific MediaGrid (make sure it handles 'items' correctly).
           If you used my previous typed version, you may need 'as any' if initialItems 
           coming from server are strictly typed differently.
        */}
        <MediaGrid items={items} mediaType={mediaType} loading={loading && items.length === 0} />

        <div ref={lastItemRef} className="h-20 flex items-center justify-center mt-8">
          {loading && items.length > 0 && (
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}

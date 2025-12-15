'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, ChevronDown } from 'lucide-react';
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
  const observer = useRef<IntersectionObserver | null>(null);

  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(defaultMediaType);
  const [genreId, setGenreId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'release_date'>('popularity');

  const [genres, setGenres] = useState(initialGenres);
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotalPages > 1);

  const getCategoryTitle = (cat: string) =>
    cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const removeDuplicates = (arr: any[]) => {
    const seen = new Set();
    return arr.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });
  };

  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let data;

      if (mediaType === 'tv') {
        if (category === 'popular') data = await tmdbApi.getTVByCategory('popular', pageNum);
        else if (category === 'top-rated') data = await tmdbApi.getTVByCategory('top-rated', pageNum);
        else if (category === 'on-the-air') data = await tmdbApi.getTVByCategory('on-the-air', pageNum);
        else if (category === 'airing-today') data = await tmdbApi.getTVByCategory('airing-today', pageNum);
        else data = await tmdbApi.discoverTVShows({ page: pageNum, genreId });
      } else {
        if (category === 'popular') data = await tmdbApi.getPopularMovies(pageNum);
        else if (category === 'top-rated') data = await tmdbApi.getTopRatedMovies(pageNum);
        else if (category === 'upcoming') data = await tmdbApi.getUpcomingMovies(pageNum);
        else if (category === 'now-playing') data = await tmdbApi.getNowPlayingMovies(pageNum);
        else data = await tmdbApi.getPopularMovies(pageNum);
      }

      if (!data?.results) return;

      let results = data.results.map((i: any) => ({
        ...i,
        media_type: mediaType,
      }));

      if (sortBy === 'rating') {
        results.sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0));
      }

      if (sortBy === 'release_date') {
        results.sort((a: any, b: any) => {
          const da = new Date(a.release_date || a.first_air_date || 0).getTime();
          const db = new Date(b.release_date || b.first_air_date || 0).getTime();
          return db - da;
        });
      }

      setItems(prev =>
        reset ? results : removeDuplicates([...prev, ...results])
      );

      setHasMore(pageNum < (data.total_pages || 1));
    } finally {
      setLoading(false);
    }
  }, [mediaType, category, genreId, sortBy, loading]);

  const resetAndFetch = useCallback(async () => {
    observer.current?.disconnect();
    setItems([]);
    setPage(1);
    setHasMore(true);
    await fetchData(1, true);
  }, [fetchData]);

  useEffect(() => {
    resetAndFetch();
  }, [mediaType, genreId, sortBy]);

  useEffect(() => {
    if (mediaType !== defaultMediaType) {
      (async () => {
        const g = mediaType === 'movie'
          ? await tmdbApi.getMovieGenres()
          : await tmdbApi.getTVGenres();
        setGenres(g);
      })();
    }
  }, [mediaType, defaultMediaType]);

  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || !hasMore) return;

    observer.current?.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const next = page + 1;
        setPage(next);
        fetchData(next);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, fetchData]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="max-w-[1800px] mx-auto px-6">

        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-5xl font-bold text-white mb-2">
          {getCategoryTitle(category)}
        </h1>

        <div className="flex flex-wrap gap-3 mt-6">
          <select value={mediaType} onChange={e => setMediaType(e.target.value as any)}>
            <option value="movie">Movies</option>
            <option value="tv">TV Shows</option>
          </select>

          <select value={genreId || ''} onChange={e => setGenreId(e.target.value ? Number(e.target.value) : undefined)}>
            <option value="">All Genres</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="popularity">Popular</option>
            <option value="rating">Top Rated</option>
            <option value="release_date">Newest</option>
          </select>
        </div>

        <MediaGrid items={items} mediaType={mediaType} loading={loading && page === 1} />

        <div ref={lastItemRef} className="h-16" />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { tmdbApi } from '@/lib/api/tmdb';
import MediaGrid from '@/components/media/MediaGrid';
import { ArrowLeft, ChevronDown, Search, Sparkles } from 'lucide-react';

interface GenresPageClientProps {
  initialGenres: any[];
  movieGenres: any[]; // kept for compatibility, not required in this client
  tvGenres: any[]; // kept for compatibility, not required in this client
}

type ThumbMap = Record<number, string | null>;

const GENRE_EMOJI: Record<number, string> = {
  28: '💥', // Action
  12: '🧭', // Adventure
  16: '🧸', // Animation
  35: '😂', // Comedy
  80: '🕵️', // Crime
  99: '🎞️', // Documentary
  18: '🎭', // Drama
  10751: '👨‍👩‍👧‍👦', // Family
  14: '🪄', // Fantasy
  36: '🏛️', // History
  27: '🩸', // Horror
  10402: '🎵', // Music
  9648: '🧩', // Mystery
  10749: '💘', // Romance
  878: '🚀', // Sci-Fi
  10770: '📺', // TV Movie
  53: '🔪', // Thriller
  10752: '🪖', // War
  37: '🤠', // Western
};

function buildTmdbImage(path: string | null, size: 'w780' | 'w500' | 'original' = 'w780') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// simple concurrency limiter (keeps UI responsive + avoids blasting TMDB)
async function runLimited<T>(tasks: (() => Promise<T>)[], limit = 6) {
  const results: T[] = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return results;
}

export default function GenresPageClient({ initialGenres }: GenresPageClientProps) {
  const [allGenres] = useState(initialGenres);
  const [selectedGenre, setSelectedGenre] = useState<any>(null);

  const [mixedContent, setMixedContent] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'latest'>('popular');
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [canLoadMore, setCanLoadMore] = useState(true);

  const [showGenreGrid, setShowGenreGrid] = useState(true);
  const [genreQuery, setGenreQuery] = useState('');

  const [thumbs, setThumbs] = useState<ThumbMap>({});
  const [thumbsLoading, setThumbsLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const filteredGenres = useMemo(() => {
    const q = genreQuery.trim().toLowerCase();
    if (!q) return allGenres;
    return allGenres.filter((g) => String(g.name || '').toLowerCase().includes(q));
  }, [allGenres, genreQuery]);

  const fetchMixedContent = async (genre: any, page: number, sort: 'popular' | 'latest') => {
    if (!genre) return [];

    const [movieData, tvData] = await Promise.all([
      tmdbApi.getMoviesByGenre(genre.id, page),
      tmdbApi.getTVShowsByGenre(genre.id, page),
    ]);

    const movies = (movieData?.results || []).map((item: any) => ({ ...item, media_type: 'movie' }));
    const tvShows = (tvData?.results || []).map((item: any) => ({ ...item, media_type: 'tv' }));

    const mixed = [...movies, ...tvShows];

    if (sort === 'latest') {
      mixed.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
        const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
        return dateB - dateA;
      });
    } else {
      mixed.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }

    return mixed.slice(0, 20);
  };

  const fetchInitialContent = async (genre: any, sort: 'popular' | 'latest') => {
    // cancel in-flight request to avoid flicker / state races
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setCurrentPage(1);

    try {
      const data = await fetchMixedContent(genre, 1, sort);
      if (controller.signal.aborted) return;

      setMixedContent(data || []);
      setCanLoadMore(Boolean(data && data.length === 20));
    } catch (error: any) {
      if (error?.name !== 'AbortError') console.error('Failed to fetch content:', error);
      setMixedContent([]);
      setCanLoadMore(false);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  const selectGenre = (genre: any) => {
    setSelectedGenre(genre);
    setShowGenreGrid(false);
    setMixedContent([]);
    setCanLoadMore(true);
    fetchInitialContent(genre, sortBy);
  };

  const loadMoreContent = async () => {
    if (isLoading || !canLoadMore || !selectedGenre) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;

    try {
      const data = await fetchMixedContent(selectedGenre, nextPage, sortBy);
      if (data && data.length > 0) {
        setMixedContent((prev) => [...prev, ...data]);
        setCurrentPage(nextPage);
        setCanLoadMore(data.length === 20);
      } else {
        setCanLoadMore(false);
      }
    } catch (error) {
      console.error('Failed to load more content:', error);
      setCanLoadMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToGenres = () => {
    abortRef.current?.abort();
    setSelectedGenre(null);
    setShowGenreGrid(true);
    setMixedContent([]);
    setCurrentPage(1);
    setCanLoadMore(true);
  };

  const handleSortChange = (newSort: 'popular' | 'latest') => {
    setSortBy(newSort);
    if (selectedGenre) fetchInitialContent(selectedGenre, newSort);
  };

  // Genre thumbnails (1 representative backdrop per genre)
  useEffect(() => {
    let cancelled = false;

    const loadThumbs = async () => {
      if (!showGenreGrid) return;
      setThumbsLoading(true);

      const missing = allGenres
        .map((g) => g?.id)
        .filter((id: number) => typeof id === 'number' && thumbs[id] === undefined);

      const tasks = missing.map((id) => async () => {
        try {
          const res = await tmdbApi.getMoviesByGenre(id, 1);
          const pick = (res?.results || []).find((x: any) => x?.backdrop_path || x?.poster_path);
          const url = buildTmdbImage(pick?.backdrop_path || pick?.poster_path, 'w780');
          return { id, url: url ?? null };
        } catch {
          return { id, url: null };
        }
      });

      try {
        const results = await runLimited(tasks, 6);
        if (cancelled) return;

        setThumbs((prev) => {
          const next = { ...prev };
          results.forEach((r) => (next[r.id] = r.url));
          return next;
        });
      } finally {
        if (!cancelled) setThumbsLoading(false);
      }
    };

    loadThumbs();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGenreGrid, allGenres]);

  return (
    <div className="min-h-screen bg-[#09090b] pb-24 pt-28 px-6 md:px-12 selection:bg-blue-500/30">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="relative mb-10 flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          {selectedGenre ? (
            <div className="w-full flex flex-col items-center">
              <button
                onClick={goBackToGenres}
                className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Genres
              </button>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-chillax">
                {selectedGenre.name}
              </h1>
              <p className="mt-4 text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
                Movies and TV shows in this genre.
              </p>
            </div>
          ) : (
            <div className="w-full">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white font-chillax">
                Genres
              </h1>
              <p className="mt-4 text-gray-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed mx-auto">
                Browse content by mood, theme, and style.
              </p>
            </div>
          )}
        </header>

        {/* Sticky bar */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-24 z-30">
          {showGenreGrid ? (
            <div className="w-full md:w-[420px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={genreQuery}
                onChange={(e) => setGenreQuery(e.target.value)}
                placeholder="Search genres…"
                className="w-full bg-[#0F0F0F] hover:bg-[#151515] border border-white/10 rounded-full pl-11 pr-4 py-3.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-lg shadow-black/20"
              />
            </div>
          ) : (
            <div className="w-full md:w-auto flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as any)}
                  className="appearance-none bg-[#0F0F0F] hover:bg-[#151515] border border-white/10 rounded-full pl-4 pr-10 py-3.5 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-lg shadow-black/20"
                >
                  <option value="popular">Most Popular</option>
                  <option value="latest">Latest Releases</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {mixedContent.length > 0 && !isLoading && (
                <div className="hidden md:flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-widest px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span>{mixedContent.length} Titles</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Genre grid */}
        {showGenreGrid && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredGenres.map((genre) => {
              const thumb = thumbs[genre.id] ?? null;
              const emoji = GENRE_EMOJI[genre.id] ?? '🎭';

              return (
                <button
                  key={genre.id}
                  onClick={() => selectGenre(genre)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  {thumb ? (
                    <div className="absolute inset-0">
                      <Image
                        src={thumb}
                        alt={`${genre.name} thumbnail`}
                        fill
                        className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.06]"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 240px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/35 to-[#09090b]/10" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent" />
                  )}

                  <div className="relative p-5 h-[112px] flex flex-col justify-end">
                    <div className="text-lg leading-none mb-2 opacity-90">{emoji}</div>
                    <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                      {genre.name}
                    </h3>
                    <div className="mt-2 h-[2px] w-10 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-blue-500/70 transition-all duration-500 group-hover:w-full" />
                    </div>
                  </div>
                </button>
              );
            })}

            {thumbsLoading && filteredGenres.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-500 py-10">
                Loading genres…
              </div>
            )}
          </div>
        )}

        {/* Genre content */}
        {selectedGenre && !showGenreGrid && (
          <>
            <MediaGrid items={mixedContent} mediaType="mixed" loading={isLoading && currentPage === 1} />

            {mixedContent.length > 0 && canLoadMore && (
              <div className="mt-20 text-center">
                <button
                  onClick={loadMoreContent}
                  disabled={isLoading}
                  className="group relative bg-white text-black font-bold py-4 px-12 rounded-full transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:shadow-[0_0_60px_rgba(255,255,255,0.14)]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Loading…</span>
                    </div>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}

            {!canLoadMore && mixedContent.length > 0 && (
              <div className="mt-20 text-center border-t border-white/5 pt-10">
                <p className="text-gray-500 text-sm font-light tracking-wide">
                  You’ve reached the end of {selectedGenre.name}.
                </p>
              </div>
            )}

            {!isLoading && mixedContent.length === 0 && (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-24 h-24 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <span className="text-4xl opacity-50">🎬</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No titles found</h3>
                <p className="text-gray-500 max-w-md font-light">
                  Try another genre or switch sorting.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

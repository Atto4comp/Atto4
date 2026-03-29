'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Film, Loader2, Search, Tv, X } from 'lucide-react';

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w154';

interface SearchBarProps {
  onClose?: () => void;
}

interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv';
  poster_path: string | null;
  title?: string;
  name?: string;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.trim().length > 1) {
        fetchResults(query.trim());
      } else {
        setResults([]);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [query]);

  const fetchResults = async (value: string) => {
    setLoading(true);

    try {
      const res = await fetch(
        `${TMDB_SEARCH_URL}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(value)}&page=1`
      );
      const data = (await res.json()) as { results?: SearchResult[] };
      const filtered = (data.results || [])
        .filter(
          (item) =>
            (item.media_type === 'movie' || item.media_type === 'tv') &&
            item.poster_path &&
            (item.popularity || 0) > 5
        )
        .slice(0, 6);

      setResults(filtered);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose?.();
  };

  return (
    <div className="relative mx-auto w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
          <Search className="h-4 w-4 text-white/28" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies and series…"
            className="w-full border-none bg-transparent text-sm text-white placeholder:text-white/24 focus:outline-none"
          />
          <div className="flex items-center gap-1.5">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" />}
            {query && !loading && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-md p-1.5 text-white/32 transition-colors hover:text-white/56"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="submit"
              className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] p-1.5 text-white/48 transition-all hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              aria-label="Search"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>

      {(results.length > 0 || (query.length > 1 && !loading && results.length === 0)) && (
        <div className="mt-2 overflow-hidden rounded-lg border border-white/[0.06] bg-[rgba(8,9,14,0.96)] p-1.5 backdrop-blur-xl">
          {results.length > 0 ? (
            <div className="space-y-0.5">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.media_type}/${item.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="relative h-14 w-10 overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.03]">
                    <Image
                      src={`${TMDB_IMAGE_BASE}${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[13px] font-medium text-white/84">{item.title || item.name}</h4>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/32">
                      <span className="flex items-center gap-0.5 capitalize">
                        {item.media_type === 'movie' ? <Film className="h-2.5 w-2.5" /> : <Tv className="h-2.5 w-2.5" />}
                        {item.media_type}
                      </span>
                      <span className="h-[3px] w-[3px] rounded-full bg-white/16" />
                      <span>{(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}</span>
                    </div>
                  </div>

                  <div className="text-[10px] font-medium text-white/32">
                    {item.vote_average?.toFixed(1) || 'N/A'}
                  </div>
                </Link>
              ))}

              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="mt-1 flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-[12px] text-white/44 transition-colors hover:bg-white/[0.04] hover:text-white/64"
              >
                <span>See all results for &quot;{query}&quot;</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="rounded-lg bg-white/[0.02] px-4 py-6 text-center text-[12px] text-white/32">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

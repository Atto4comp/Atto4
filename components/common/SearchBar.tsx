'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Film, Tv, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

interface SearchBarProps {
  onClose?: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus on open
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 1) {
        fetchResults(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchResults = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${TMDB_SEARCH_URL}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(q)}&page=1`
      );
      const data = await res.json();
      
      const filtered = (data.results || [])
        .filter((item: any) => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          item.poster_path && 
          item.popularity > 5
        )
        .slice(0, 5); // Top 5 results only

      setResults(filtered);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    router.push(`/search?q=${encodeURIComponent(query)}`);
    if (onClose) onClose();
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      {/* Search Input Capsule */}
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center w-full bg-[#1a1a1a] border border-white/10 rounded-full overflow-hidden shadow-2xl transition-all focus-within:border-white/30 focus-within:ring-1 focus-within:ring-white/20"
      >
        <div className="pl-5 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, shows, genres..."
          className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-4 text-base focus:outline-none font-medium"
        />

        <div className="pr-2 flex items-center gap-2">
          {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
          
          {query && !loading && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <button 
            type="submit"
            className="hidden sm:flex p-2 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Quick Results Dropdown */}
      {(results.length > 0 || (query.length > 1 && !loading && results.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2">
          
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Top Results
              </div>
              
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.media_type}/${item.id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-800 shadow-sm group-hover:shadow-md transition-all">
                    <Image
                      src={`${TMDB_IMAGE_BASE}${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {item.title || item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1 capitalize">
                        {item.media_type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        {item.media_type}
                      </span>
                      <span>•</span>
                      <span>
                        {(item.release_date || item.first_air_date)?.split('-')[0] || 'TBA'}
                      </span>
                      <span className="ml-auto text-yellow-500 font-semibold flex items-center gap-1">
                        ★ {item.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* View All Link */}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={onClose}
                className="block mt-2 mx-2 py-3 text-center text-sm font-medium text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors border border-blue-500/20"
              >
                View all results for "{query}"
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

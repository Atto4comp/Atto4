// components/media/MediaGrid.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';

// Types
type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  overview?: string;
};

interface Props {
  items: MediaItem[];
  mediaType: 'movie' | 'tv' | 'mixed';
  loading?: boolean;
}

export default function MediaGrid({ items, mediaType, loading }: Props) {
  
  // ✅ Helper Functions defined INSIDE component scope
  const getItemTitle = (item: MediaItem) => item.title || item.name || 'Untitled';
  
  const getItemYear = (item: MediaItem) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  const formatRating = (rating?: number) => {
    if (!rating || rating === 0) return null;
    return rating.toFixed(1);
  };

  const getItemHref = (item: MediaItem) => {
    if (mediaType === 'mixed') {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      return `/${type}/${item.id}`;
    }
    return `/${mediaType}/${item.id}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full aspect-video bg-gray-900 rounded-xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎬</div>
        <p className="text-gray-400 text-lg">No content available</p>
        <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const title = getItemTitle(item);
        const year = getItemYear(item);
        const rating = formatRating(item.vote_average);
        const href = getItemHref(item);
        
        // Prefer backdrop for horizontal layout, fallback to poster
        const posterUrl = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
          : item.poster_path 
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : null;

        return (
          <Link key={`${item.id}-${item.media_type || mediaType}`} href={href} className="group block">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-white/20 group-hover:-translate-y-1">
              
              {/* Image */}
              <Image
                src={posterUrl || '/placeholder-movie.jpg'}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
              
              {/* Play Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[1px]">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                </div>
              </div>

              {/* Content Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex justify-between items-end">
                  <div className="flex-1 mr-2">
                    <h3 className="text-white font-bold text-base leading-tight line-clamp-1 font-chillax">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 font-medium">
                      {year || 'Unknown'}
                    </p>
                  </div>
                  
                  {rating && (
                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold text-white">{rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

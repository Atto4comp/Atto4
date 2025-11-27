// components/media/MediaGrid.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';

// ... (Types remain the same)

// ✅ Modern Landscape Grid
export default function MediaGrid({ items, mediaType, loading }: Props) {
  // ... (Helper functions remain the same)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full aspect-video bg-gray-900 rounded-xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  // ... (Empty state remains the same)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => {
        const title = getItemTitle(item);
        const year = getItemYear(item);
        const rating = formatRating(item.vote_average);
        const href = getItemHref(item);
        const posterUrl = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
          : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

        return (
          <Link key={`${item.id}-${item.media_type || mediaType}`} href={href} className="group block">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-white/20 group-hover:-translate-y-1">
              
              {/* Image */}
              <Image
                src={posterUrl || '/placeholder-backdrop.jpg'}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-90" />
              
              {/* Play Icon on Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
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

'use client';

import MediaCard from '@/components/media/MediaCard';

// Types (Aligning with what MediaCard expects)
// We need to map your grid items to the shape MediaCard expects
import { Movie, Genre } from '@/lib/api/types'; 

interface MediaItem {
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
}

interface Props {
  items: MediaItem[];
  mediaType: 'movie' | 'tv' | 'mixed';
  loading?: boolean;
}

export default function MediaGrid({ items, mediaType, loading }: Props) {

  // Loading Skeletons
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ml-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full aspect-video bg-gray-900 rounded-xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  // Empty State
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-8 gap-x-4">
      {items.map((item) => {
        // 1. Determine the effective media type for this specific card
        // If grid is 'mixed' (like Search), check item.media_type. Fallback to prop.
        const effectiveMediaType = 
          mediaType === 'mixed' 
            ? (item.media_type === 'tv' ? 'tv' : 'movie') 
            : mediaType;

        // 2. Adapt the data to match MediaCard's "Movie" interface
        // MediaCard expects 'Movie' type which usually has specific fields.
        // We cast it or map it to ensure compatibility.
        const mappedMedia: any = {
          ...item,
          id: item.id,
          title: item.title || item.name || '', // Ensure title exists
          name: item.name || item.title || '',   // Ensure name exists
          media_type: effectiveMediaType,
          vote_average: item.vote_average || 0,
        };

        return (
          <div key={`${item.id}-${effectiveMediaType}`} className="flex justify-center sm:justify-start">
             <MediaCard 
                media={mappedMedia}
                mediaType={effectiveMediaType}
                genres={[]} // Genres are optional/visual in the card usually
             />
          </div>
        );
      })}
    </div>
  );
}

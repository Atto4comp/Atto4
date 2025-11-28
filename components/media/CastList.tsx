'use client';

import Image from 'next/image';

// Match the type structure from TMDB API responses
interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastListProps {
  cast: CastMember[];
}

// Consistent with tmdb.ts image logic
const TMDB_PROFILE_SIZE = 'w185';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function CastList({ cast }: CastListProps) {
  // Defensive check for undefined or empty cast arrays
  if (!cast || !Array.isArray(cast) || cast.length === 0) {
    return null;
  }

  // Limit to top 15 cast members for performance and UI cleanliness
  const visibleCast = cast.slice(0, 15);

  const buildProfileImage = (path: string | null) => {
    if (!path) return null;
    // Ensure leading slash handling matches tmdb.ts logic
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${TMDB_IMAGE_BASE}/${TMDB_PROFILE_SIZE}${p}`;
  };

  return (
    <div className="w-full py-8">
      <h3 className="text-xl font-bold text-white font-chillax mb-5 px-4 md:px-0">Top Cast</h3>
      
      {/* Horizontal Scroll Container */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-4 snap-x snap-mandatory">
        {visibleCast.map((person) => {
          const imageUrl = buildProfileImage(person.profile_path);

          return (
            <div 
              key={person.id} 
              className="flex flex-col items-center w-[90px] flex-shrink-0 group cursor-pointer snap-start"
            >
              {/* Image Circle Container */}
              <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white/10 bg-gray-800 shadow-lg transition-all duration-300 group-hover:border-white/40 group-hover:shadow-xl mb-3">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="80px"
                  />
                ) : (
                  // Fallback for missing profile image
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {person.name.slice(0, 2)}
                  </div>
                )}
              </div>
              
              {/* Actor Name */}
              <p className="text-[13px] text-center font-semibold text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors w-full">
                {person.name}
              </p>
              
              {/* Character Name */}
              <p className="text-[11px] text-center text-gray-400 leading-tight line-clamp-1 mt-1 w-full">
                {person.character}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

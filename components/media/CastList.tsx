'use client';

import Image from 'next/image';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastListProps {
  cast: CastMember[];
}

export default function CastList({ cast }: CastListProps) {
  if (!cast || cast.length === 0) return null;

  // Limit to top 15 for performance/cleanliness
  const visibleCast = cast.slice(0, 15);

  return (
    <div className="w-full py-6">
      <h3 className="text-xl font-bold text-white font-chillax mb-5 px-4 md:px-0">Top Cast</h3>
      
      {/* Scroll container */}
      <div className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-4">
        {visibleCast.map((person) => (
          <div key={person.id} className="flex flex-col items-center w-[90px] flex-shrink-0 group cursor-pointer">
            {/* Image Circle */}
            <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-all duration-300 mb-3 shadow-lg bg-gray-800">
              {person.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs text-gray-500 font-medium">
                  No Image
                </div>
              )}
            </div>
            
            {/* Name */}
            <p className="text-[13px] text-center font-semibold text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
              {person.name}
            </p>
            
            {/* Character */}
            <p className="text-[11px] text-center text-gray-400 leading-tight line-clamp-1 mt-0.5">
              {person.character}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

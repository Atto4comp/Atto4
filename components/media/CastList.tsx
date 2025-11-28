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

const TMDB_PROFILE_SIZE = 'w185';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function CastList({ cast }: CastListProps) {
  if (!cast || !Array.isArray(cast) || cast.length === 0) {
    return null;
  }

  // Show top 20
  const visibleCast = cast.slice(0, 20);

  const buildProfileImage = (path: string | null) => {
    if (!path) return null;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${TMDB_IMAGE_BASE}/${TMDB_PROFILE_SIZE}${p}`;
  };

  return (
    <div className="w-full py-8 relative group/cast">
      <h3 className="text-xl font-bold text-white font-chillax mb-5 px-4 md:px-0">Top Cast</h3>
      
      <div className="relative w-full">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory w-full custom-scrollbar">
          {visibleCast.map((person) => {
            const imageUrl = buildProfileImage(person.profile_path);
            return (
              <div 
                key={person.id} 
                className="flex flex-col items-center w-[90px] md:w-[110px] flex-shrink-0 snap-start cursor-pointer group/actor"
              >
                <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden border-2 border-white/10 bg-gray-800 shadow-lg transition-all duration-300 group-hover/actor:border-white/40 group-hover/actor:shadow-xl mb-3">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={person.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/actor:scale-110"
                      sizes="(max-width: 768px) 80px, 100px"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                      {person.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                
                <p className="text-xs md:text-sm text-center font-semibold text-white leading-tight line-clamp-2 group-hover/actor:text-blue-400 transition-colors w-full px-1">
                  {person.name}
                </p>
                
                <p className="text-[10px] md:text-xs text-center text-gray-400 leading-tight line-clamp-1 mt-1 w-full px-1">
                  {person.character}
                </p>
              </div>
            );
          })}
          
          {/* Spacer for right edge scrolling */}
          <div className="w-4 flex-shrink-0" />
        </div>

        {/* Desktop Fade Gradient */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#050505] to-transparent pointer-events-none hidden md:block opacity-0 group-hover/cast:opacity-100 transition-opacity duration-300" />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}

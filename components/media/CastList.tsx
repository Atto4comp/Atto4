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
  // Debug logging
  console.log('CastList received cast:', cast);

  if (!cast || !Array.isArray(cast) || cast.length === 0) {
    console.log('CastList: No cast data available');
    return null;
  }

  const visibleCast = cast.slice(0, 15);

  const buildProfileImage = (path: string | null) => {
    if (!path) return null;
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${TMDB_IMAGE_BASE}/${TMDB_PROFILE_SIZE}${p}`;
  };

  return (
    <div className="w-full py-8">
      <h3 className="text-xl font-bold text-white font-chillax mb-5 px-4 md:px-0">Top Cast</h3>
      
      <div className="flex gap-5 overflow-x-auto pb-4 px-4 md:px-0 snap-x snap-mandatory">
        <style jsx>{`
          div::-webkit-scrollbar {
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
        
        {visibleCast.map((person) => {
          const imageUrl = buildProfileImage(person.profile_path);

          return (
            <div 
              key={person.id} 
              className="flex flex-col items-center w-[90px] flex-shrink-0 group cursor-pointer snap-start"
            >
              <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white/10 bg-gray-800 shadow-lg transition-all duration-300 group-hover:border-white/40 group-hover:shadow-xl mb-3">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={person.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {person.name.slice(0, 2)}
                  </div>
                )}
              </div>
              
              <p className="text-[13px] text-center font-semibold text-white leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors w-full">
                {person.name}
              </p>
              
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

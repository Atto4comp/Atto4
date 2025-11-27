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

  // Show top 10 cast members
  const visibleCast = cast.slice(0, 10);

  return (
    <div className="w-full py-8">
      <h3 className="text-xl font-bold text-white font-chillax mb-4 px-4 md:px-0">Top Cast</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 pb-4">
        {visibleCast.map((person) => (
          <div key={person.id} className="flex flex-col items-center w-[100px] flex-shrink-0 group">
            <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-colors mb-2 bg-gray-800">
              {person.profile_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={person.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 text-xs text-gray-400">
                  N/A
                </div>
              )}
            </div>
            <p className="text-xs text-center font-medium text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
              {person.name}
            </p>
            <p className="text-[10px] text-center text-gray-400 line-clamp-1">
              {person.character}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

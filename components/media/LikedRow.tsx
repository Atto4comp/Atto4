// components/media/LikedRow.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, Play } from 'lucide-react';
import { likedStorage, WatchlistItem } from '@/lib/storage/watchlist';

const TMDB_IMAGE_SIZES = {
  poster: 'w500',
} as const;

export default function LikedRow() {
  const [liked, setLiked] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const buildImage = (item: WatchlistItem) => {
    if (item.poster_path) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.poster}${item.poster_path}`;
    return '/placeholder-movie.jpg';
  };

  useEffect(() => {
    const loadLiked = () => {
      const items = likedStorage.getLiked();
      setLiked(items);
      setLoading(false);
    };
    loadLiked();
    const handleStorageChange = () => loadLiked();
    window.addEventListener('liked-updated', handleStorageChange);
    return () => window.removeEventListener('liked-updated', handleStorageChange);
  }, []);

  const handleRemove = (id: number, mediaType: 'movie' | 'tv', event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    likedStorage.removeFromLiked(id, mediaType);
    setLiked(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  if (loading) {
    return (
      <div className="section-shell mb-10">
        <div className="h-6 w-36 skeleton-pulse rounded-md mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex-shrink-0 w-[156px] sm:w-[172px] md:w-[190px] aspect-[2/3] skeleton-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (liked.length === 0) return null;

  return (
    <section className="section-shell relative mb-10 md:mb-14">
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="font-display text-lg font-semibold tracking-tight text-white/92 md:text-xl">
          Liked
        </h2>
        <span className="rounded-md bg-rose-500/12 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
          {liked.length}
        </span>
      </div>

      <div className="edge-fade hide-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {liked.map((item) => {
          const title = item.media_type === 'movie' ? item.title : item.name;
          const releaseDate = item.media_type === 'movie' ? item.release_date : item.first_air_date;
          const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

          return (
            <div key={`${item.media_type}-${item.id}`} className="snap-start flex-shrink-0 w-[156px] sm:w-[172px] md:w-[190px] group">
              <Link href={`/${item.media_type}/${item.id}`} className="block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.05] bg-[#0a0a0e] transition-all duration-300 group-hover:-translate-y-1">
                  <Image
                    src={buildImage(item)}
                    alt={title || 'Media'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 156px, (max-width: 768px) 172px, 190px"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/48 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-250">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/watch/${item.media_type}/${item.id}`);
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110"
                    >
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    </button>
                    <button
                      onClick={(e) => handleRemove(item.id, item.media_type, e)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white transition-transform hover:scale-110"
                      title="Unlike"
                    >
                      <Heart className="h-3.5 w-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Rating */}
                  {item.vote_average > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/48 backdrop-blur-md px-1.5 py-0.5 border border-white/[0.06]">
                      <Star className="w-[9px] h-[9px] fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
                      <span className="text-[9px] font-semibold text-white/72">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-2.5 px-0.5">
                  <h3 className="font-display text-[13px] font-medium tracking-tight text-white/88 line-clamp-1">{title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/28">
                    {year && <span>{year}</span>}
                    {year && <span className="h-[3px] w-[3px] rounded-full bg-white/16" />}
                    <span className="uppercase">{item.media_type}</span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

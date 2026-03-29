'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Play } from 'lucide-react';
import { Movie } from '@/lib/api/types';

interface HeroSectionProps {
  media: Movie[];
  genres?: { id: number; name: string }[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
} as const;

export default function HeroSection({ media, genres = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || media.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [isAutoPlaying, media.length]);

  const buildTmdbImage = (path: string | null, size = 'original') => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getMovieGenres = (genreIds: number[]) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!media || media.length === 0) return null;

  const currentMovie = media[currentIndex];
  const movieGenres = getMovieGenres(currentMovie.genre_ids || []);
  const releaseYear = currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : null;

  return (
    <section className="relative -mt-16 overflow-hidden pb-8 pt-16 md:-mt-20 md:pb-12 md:pt-20">
      {/* Backdrop Images with Ken Burns */}
      <div className="absolute inset-0">
        {media.slice(0, 5).map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={buildTmdbImage(movie.backdrop_path, TMDB_IMAGE_SIZES.backdrop)}
              alt={movie.title || 'Featured title'}
              fill
              priority={index === 0}
              quality={85}
              sizes="100vw"
              className="animate-ken-burns object-cover object-center"
            />
          </div>
        ))}
        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/50 to-[#050507]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 via-[#050507]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050507] to-transparent" />
      </div>

      {/* Content */}
      <div className="section-shell relative z-10">
        <div className="flex min-h-[85svh] items-end pb-8 pt-24 lg:pb-14">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Meta Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/36"
                >
                  <span className="rounded-md border border-white/[0.1] bg-white/[0.06] px-2.5 py-1">Featured</span>
                  {releaseYear && <span className="text-white/44">{releaseYear}</span>}
                  {currentMovie.vote_average ? (
                    <span className="text-[var(--accent-warm)] font-semibold">★ {currentMovie.vote_average.toFixed(1)}</span>
                  ) : null}
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.45 }}
                  className="font-display text-gradient text-5xl font-bold leading-[0.94] tracking-[-0.02em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
                >
                  {currentMovie.title}
                </motion.h1>

                {/* Genre Pills */}
                {movieGenres.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="mt-4 flex flex-wrap gap-1.5"
                  >
                    {movieGenres.map((genre) => (
                      <span
                        key={genre}
                        className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/48"
                      >
                        {genre}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Description */}
                {currentMovie.overview && (
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-5 max-w-lg text-[14px] leading-[1.7] text-white/52 sm:text-[15px]"
                  >
                    {currentMovie.overview.length > 180
                      ? currentMovie.overview.slice(0, 180) + '…'
                      : currentMovie.overview}
                  </motion.p>
                )}

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-7 flex flex-wrap gap-2.5"
                >
                  <Link
                    href={`/watch/movie/${currentMovie.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-[1.02]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Watch Now
                  </Link>
                  <Link
                    href={`/movie/${currentMovie.id}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-[14px] font-medium text-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.1] hover:text-white hover:border-white/[0.2]"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Details
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            {media.length > 1 && (
              <div className="mt-10 flex items-center gap-1.5">
                {media.slice(0, 5).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => goToSlide(index)}
                    className={`h-[2px] rounded-full transition-all duration-400 ${
                      index === currentIndex
                        ? 'w-8 bg-white/72'
                        : 'w-3 bg-white/16 hover:bg-white/28'
                    }`}
                    aria-label={`Go to featured title ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

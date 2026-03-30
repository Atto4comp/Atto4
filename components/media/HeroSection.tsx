'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Play, Star } from 'lucide-react';
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

  const getMovieGenres = useCallback((genreIds: number[]) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map((id) => genres.find((genre) => genre.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
  }, [genres]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!media || media.length === 0) return null;

  const currentMovie = media[currentIndex];
  const movieGenres = getMovieGenres(currentMovie.genre_ids || []);
  const releaseYear = currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : null;

  return (
    <>
      {/* ═══════════════════════════════════════════════ */}
      {/* MOBILE HERO — Netflix Vertical Poster Frame    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative -mt-16 pt-16 pb-4 md:hidden overflow-hidden">
        {/* Ambient background glow from poster */}
        <div className="absolute inset-0 -z-10">
          {media.slice(0, 5).map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={buildTmdbImage(movie.poster_path, 'w780')}
                alt=""
                fill
                className="object-cover blur-[80px] scale-150 opacity-30"
                priority={index === 0}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-6">
          {/* Vertical Poster Frame */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mobile-hero-frame animate-hero-glow"
            >
              <Image
                src={buildTmdbImage(currentMovie.poster_path, 'w780')}
                alt={currentMovie.title || 'Featured title'}
                fill
                priority
                quality={90}
                sizes="78vw"
                className="object-cover"
              />

              {/* Overlaid content at bottom of frame */}
              <div className="absolute bottom-0 left-0 right-0 z-[2] px-4 pb-4">
                {/* Rating badge */}
                {currentMovie.vote_average ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-warm)] mb-2 border border-white/[0.08]"
                  >
                    <Star className="h-[9px] w-[9px] fill-[var(--accent-warm)]" />
                    {currentMovie.vote_average.toFixed(1)}
                    {releaseYear && <span className="text-white/40 ml-1">• {releaseYear}</span>}
                  </motion.div>
                ) : null}

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="font-display text-[1.4rem] leading-[1.05] font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] line-clamp-2"
                >
                  {currentMovie.title}
                </motion.h1>

                {/* Genre chips */}
                {movieGenres.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-1.5 flex flex-wrap gap-1"
                  >
                    {movieGenres.map((genre, i) => (
                      <span key={genre} className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/50">
                        {i > 0 && <span className="mr-1">•</span>}
                        {genre}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* CTAs inside frame */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.35 }}
                  className="mt-3 flex w-full gap-2"
                >
                  <Link
                    href={`/watch/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white py-2 text-[13px] font-bold text-black active:scale-[0.97] transition-transform"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Play
                  </Link>
                  <Link
                    href={`/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-white/[0.08] py-2 text-[13px] font-semibold text-white/90 backdrop-blur-md active:scale-[0.97] transition-transform"
                  >
                    <Info className="h-4 w-4 opacity-70" />
                    More Info
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide Indicators */}
          {media.length > 1 && (
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {media.slice(0, 5).map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => goToSlide(index)}
                  className={`h-[3px] rounded-full transition-all duration-400 ${
                    index === currentIndex
                      ? 'w-7 bg-white/80'
                      : 'w-2.5 bg-white/20'
                  }`}
                  aria-label={`Go to featured title ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* DESKTOP HERO — Full-Bleed Widescreen (existing)*/}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative -mt-20 overflow-hidden pb-12 pt-20 hidden md:block">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[#050507]/50 to-[#050507]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/90 via-[#050507]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent" />
        </div>

        {/* Content */}
        <div className="section-shell relative z-10">
          <div className="flex min-h-[85svh] items-end pb-14 pt-24 justify-start">
            <div className="w-full max-w-2xl flex flex-col items-start text-left">
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
                      className="mb-4 flex flex-wrap items-center justify-start gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50"
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
                      className="font-display text-gradient text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight"
                    >
                      {currentMovie.title}
                    </motion.h1>

                  {/* Genre Pills */}
                  {movieGenres.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mt-4 flex flex-wrap gap-2 justify-start"
                      >
                        {movieGenres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded-md border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-md drop-shadow-md"
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
                        className="mt-5 max-w-lg text-[15px] leading-[1.6] text-white/60"
                      >
                        {currentMovie.overview.length > 200
                          ? currentMovie.overview.slice(0, 200) + '…'
                          : currentMovie.overview}
                      </motion.p>
                  )}

                  {/* CTAs */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="mt-7 flex flex-row gap-3"
                    >
                      <Link
                        href={`/watch/movie/${currentMovie.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-[15px] font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        Play
                      </Link>
                      <Link
                        href={`/movie/${currentMovie.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-95"
                      >
                        <Info className="h-4 w-4" />
                        Details
                      </Link>
                    </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Slide Indicators */}
              {media.length > 1 && (
                <div className="mt-8 flex items-center justify-start gap-1.5 w-full">
                  {media.slice(0, 5).map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => goToSlide(index)}
                      className={`h-[3px] rounded-full transition-all duration-400 ${
                        index === currentIndex
                          ? 'w-8 bg-white/90'
                          : 'w-3 bg-white/20 hover:bg-white/40'
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
    </>
  );
}

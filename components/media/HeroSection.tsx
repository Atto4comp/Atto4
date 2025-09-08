'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Movie } from '@/lib/api/types';

interface HeroSectionProps {
  media: Movie[];
  genres?: { id: number; name: string }[];
}

export default function HeroSection({ media, genres = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const buildTmdbImage = (path: string | null, size: string = 'original'): string => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  // Get movie genres
  const getMovieGenres = (genreIds: number[]) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3); // Max 3 genres
  };

  // Auto-slide
  useEffect(() => {
    if (!isAutoPlaying || media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, media.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!media || media.length === 0) return null;
  const currentMovie = media[currentIndex];
  const movieGenres = getMovieGenres(currentMovie.genre_ids || []);

  // Enhanced Mobile Layout (Card Style)
  if (isMobile) {
    return (
      // reserve header space: calc(100vh - 64px) and add padding-top of header height
      <div className="relative w-full min-h-[calc(100vh-64px)] bg-black overflow-hidden pt-16">
        {/* Subtle Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
        </div>

        {/* Main Card Container */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
          <div className="w-full max-w-sm">
            {/* Movie Card */}
            <div className="relative bg-gradient-to-b from-gray-800/50 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              {/* Poster Section */}
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={buildTmdbImage(currentMovie.poster_path, 'w780')}
                  alt={currentMovie.title || 'Movie poster'}
                  fill
                  className="object-cover"
                  priority
                  sizes="400px"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                {/* Rating Badge */}
                {currentMovie.vote_average && (
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                    <span className="text-yellow-400">★</span>
                    <span>{currentMovie.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Navigation Arrows (On Poster) */}
                {media.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full transition-all border border-white/20"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full transition-all border border-white/20"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Title Overlay on Poster */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight drop-shadow-lg">
                    {currentMovie.title}
                  </h1>

                  {/* Year */}
                  {currentMovie.release_date && (
                    <p className="text-gray-200 text-sm font-medium mb-3">
                      {new Date(currentMovie.release_date).getFullYear()}
                    </p>
                  )}

                  {/* Genres */}
                  {movieGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movieGenres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Section */}
              <div className="p-6 space-y-4">
                {/* Overview */}
                {currentMovie.overview && (
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {currentMovie.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link
                    href={`/watch/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play</span>
                  </Link>
                  <Link
                    href={`/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-medium py-3.5 px-4 rounded-xl transition-all border border-white/20"
                  >
                    <Info className="w-4 h-4" />
                    <span>More Info</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            {media.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                {media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="relative w-full h-[85vh] min-h-[700px] max-h-[900px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {media.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={buildTmdbImage(movie.backdrop_path, 'original')}
              alt={movie.title || 'Movie backdrop'}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={100}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Desktop Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full transition-all"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Desktop Content */}
      <div className="relative z-10 h-full flex items-end">
        <div className="max-w-3xl px-10 pb-32">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm mb-5">
            {currentMovie.release_date && (
              <span className="bg-gray-800/70 px-3 py-1 rounded-full text-xs">
                {new Date(currentMovie.release_date).getFullYear()}
              </span>
            )}
            {currentMovie.vote_average && (
              <div className="flex items-center gap-1 bg-neutral-900/90 text-white px-3 py-1 rounded-full text-xs font-bold">
                <span>⭐</span>
                <span>{currentMovie.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Overview */}
          {currentMovie.overview && (
            <p className="text-gray-200 text-base leading-relaxed line-clamp-3 max-w-xl mb-7 drop-shadow-md">
              {currentMovie.overview}
            </p>
          )}

          {/* Desktop Buttons */}
          <div className="flex gap-4">
            <Link
              href={`/watch/movie/${currentMovie.id}`}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-200 text-black font-semibold px-8 py-3 rounded-md transition-all text-base shadow-md"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </Link>
            <Link
              href={`/movie/${currentMovie.id}`}
              className="inline-flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white font-medium px-8 py-3 rounded-md transition-all text-base"
            >
              <Info className="w-5 h-5" />
              More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

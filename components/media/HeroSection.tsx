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

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  backdropMobile: 'w1280',
  poster: 'w780',
} as const;

export default function HeroSection({ media, genres = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

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

  const getMovieGenres = (genreIds: number[]) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
  };

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

  // ==========================================
  // MOBILE LAYOUT
  // ==========================================
  if (isMobile) {
    return (
      // ✅ Updated: #0B0B0C background
      <div className="relative w-full min-h-screen bg-[#0B0B0C] overflow-hidden top-0 -mt-16 sm:mt-0">
        {/* Ambient Background */}
        <div className="absolute inset-0">
          <Image
            src={buildTmdbImage(currentMovie.poster_path, 'w780')}
            alt="Background blur"
            fill
            className="object-cover opacity-30 blur-3xl scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0C]/60 via-[#0B0B0C]/40 to-[#0B0B0C]" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 pt-24 gap-6">
          
          {/* Main Vertical Poster Card */}
          <div className="relative w-full max-w-[320px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <Image
              src={buildTmdbImage(currentMovie.poster_path, TMDB_IMAGE_SIZES.poster)}
              alt={currentMovie.title || 'Movie poster'}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 320px"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

            {media.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:bg-black/40 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-white/70 hover:bg-black/40 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
              <h1 className="text-2xl font-bold text-white leading-tight font-chillax drop-shadow-md">
                {currentMovie.title}
              </h1>
              
              <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                {currentMovie.release_date && (
                  <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 text-yellow-400">
                  ★ {currentMovie.vote_average?.toFixed(1)}
                </span>
              </div>

              {movieGenres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movieGenres.map((genre, idx) => (
                    <span key={idx} className="text-[10px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-gray-300">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {media.length > 1 && (
            <div className="flex items-center justify-center gap-1.5">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/20'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex gap-3 w-full max-w-[320px]">
            <Link
              href={`/watch/movie/${currentMovie.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch</span>
            </Link>
            <Link
              href={`/movie/${currentMovie.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium py-3.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all"
            >
              <Info className="w-4 h-4" />
              <span>Info</span>
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // DESKTOP LAYOUT
  // ==========================================
  return (
    <div className="relative w-full h-[100vh] min-h-[800px] overflow-hidden -mt-[6rem] z-0">
      
      <div className="absolute inset-0">
        {media.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={buildTmdbImage(movie.backdrop_path, TMDB_IMAGE_SIZES.backdrop)}
              alt={movie.title || 'Movie backdrop'}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={100}
            />
          </div>
        ))}
        
        {/* ✅ Updated gradients with #0B0B0C */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0C]/90 via-[#0B0B0C]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/60 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0B0B0C]/60 to-transparent" />
      </div>

      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/5 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white p-3 rounded-full transition-all border border-white/5 group"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </>
      )}

      <div className="relative z-10 h-full flex items-end pb-32">
        <div className="w-full max-w-[1600px] mx-auto px-8 md:px-16">
          <div className="max-w-4xl space-y-8">
            
            <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-[0.9] tracking-tight drop-shadow-2xl font-chillax animate-in fade-in slide-in-from-bottom-10 duration-700">
              {currentMovie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-200">
              {currentMovie.release_date && (
                <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              )}
              <span className="bg-yellow-500/10 text-yellow-400 px-3 py-1.5 rounded-lg border border-yellow-500/20 flex items-center gap-1.5">
                ★ {currentMovie.vote_average?.toFixed(1)}
              </span>
              {movieGenres.map((genre, i) => (
                <span key={i} className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 text-gray-300">
                  {genre}
                </span>
              ))}
            </div>

            {currentMovie.overview && (
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed line-clamp-3 max-w-3xl drop-shadow-lg font-light">
                {currentMovie.overview}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={`/watch/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-sm"
              >
                <Play className="w-5 h-5 fill-black" />
                <span className="text-lg">Watch Now</span>
              </Link>
              
              <Link
                href={`/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                <Info className="w-5 h-5" />
                <span className="text-lg">More Info</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-12 right-12 z-20 flex gap-3">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'w-12 bg-white' 
                  : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

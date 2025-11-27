'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star, Download, Share2, ChevronLeft } from 'lucide-react';
import { MediaDetails, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';

interface MovieDetailsClientProps {
  movie: MediaDetails;
  genres: Genre[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  poster: 'w780',
} as const;

export default function MovieDetailsClient({ movie, genres }: MovieDetailsClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Image Builder
  const buildImage = (path: string | null, size: string) => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-movie.jpg';

  // Sync State
  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(movie.id, 'movie'));
    setIsLiked(likedStorage.isLiked(movie.id, 'movie'));
  }, [movie.id]);

  const toggleWatchlist = () => {
    if (isInWatchlist) watchlistStorage.removeFromWatchlist(movie.id, 'movie');
    else watchlistStorage.addToWatchlist({ id: movie.id, title: movie.title, poster_path: movie.poster_path, media_type: 'movie', vote_average: movie.vote_average || 0, release_date: movie.release_date });
    setIsInWatchlist(!isInWatchlist);
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(movie.id, 'movie');
    else likedStorage.addToLiked({ id: movie.id, title: movie.title, poster_path: movie.poster_path, media_type: 'movie', vote_average: movie.vote_average || 0, release_date: movie.release_date });
    setIsLiked(!isLiked);
  };

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';
  const formatRuntime = (min?: number) => min ? `${Math.floor(min / 60)}h ${min % 60}m` : 'N/A';

  // ========================
  // MOBILE LAYOUT (Android Compact Style)
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Background Blur */}
        <div className="absolute inset-0 h-[60vh] w-full overflow-hidden">
          <Image src={buildImage(movie.poster_path, 'w500')} alt="bg" fill className="object-cover opacity-20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-24">
          
          {/* Vertical Poster Card */}
          <div className="relative w-[220px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6">
            <Image src={buildImage(movie.poster_path, 'w780')} alt={movie.title} fill className="object-cover" priority />
          </div>

          {/* Title & Meta */}
          <h1 className="text-3xl font-bold text-white text-center font-chillax mb-2">{movie.title}</h1>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
            <span>{formatYear(movie.release_date)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">HD</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{formatRuntime(movie.runtime)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-current" /> {movie.vote_average.toFixed(1)}</span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 mb-8 w-full justify-center">
            <Link href={`/watch/movie/${movie.id}`} className="flex-1 max-w-[160px] h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </Link>

            <button onClick={toggleWatchlist} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-95 ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>

            <button onClick={toggleLike} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-95 ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Overview */}
          <p className="text-gray-300 text-sm leading-relaxed text-center line-clamp-4 mb-8 max-w-md">
            {movie.overview}
          </p>

          {/* Movie Download Button */}
          <button className="w-full max-w-md py-3 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center gap-2 text-gray-300 hover:bg-[#252525] hover:text-white transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Movie</span>
          </button>
        </div>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT
  // ========================
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Full Backdrop Hero */}
      <div className="absolute inset-0 h-[85vh] w-full">
        <Image src={buildImage(movie.backdrop_path, 'original')} alt="backdrop" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      {/* Back Nav */}
      <div className="absolute top-24 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </Link>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 pt-[25vh] pl-8 md:pl-16 max-w-3xl">
        {/* Meta Badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold tracking-wider">HD</span>
          <span className="text-gray-300 font-medium">{formatYear(movie.release_date)}</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <span className="text-gray-300 font-medium">{formatRuntime(movie.runtime)}</span>
          <span className="w-1 h-1 bg-gray-500 rounded-full" />
          <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)}</span>
        </div>

        {/* Huge Title */}
        <h1 className="text-6xl md:text-7xl font-extrabold font-chillax leading-tight mb-6 drop-shadow-2xl">
          {movie.title}
        </h1>

        {/* Overview */}
        <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl drop-shadow-md">
          {movie.overview}
        </p>

        {/* Action Row */}
        <div className="flex items-center gap-4">
          <Link href={`/watch/movie/${movie.id}`} className="h-14 px-8 bg-white text-black rounded-full flex items-center gap-2 font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Play className="w-6 h-6 fill-black" />
            Play Now
          </Link>

          <button onClick={toggleWatchlist} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all hover:scale-105 ${isInWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
            <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
          </button>

          <button onClick={toggleLike} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all hover:scale-105 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Movie Download Button (Desktop) */}
          <button className="h-14 px-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 flex items-center gap-2 text-white font-medium transition-colors ml-4">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>

        {/* Genres */}
        <div className="flex gap-2 mt-10">
          {genres.map(g => (
            <span key={g.id} className="px-4 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm text-sm text-gray-300 hover:border-white/30 transition-colors">
              {g.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

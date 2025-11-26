'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Plus, 
  Heart, 
  Star, 
  Calendar, 
  Clock, 
  Globe,
  ArrowLeft,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { MediaDetails, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';

interface MovieDetailsClientProps {
  movie: MediaDetails;
  genres: Genre[];
}

// ✅ TMDB Image size constants
const TMDB_IMAGE_SIZES = {
  backdrop: 'w1280',
  poster: 'w500',
  posterLarge: 'w780',
  profile: 'w185',
  original: 'original',
} as const;

export default function MovieDetailsClient({ movie, genres }: MovieDetailsClientProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // ✅ Helper function to build TMDB image URLs (no API key needed)
  const buildTmdbImage = (
    path: string | null, 
    size: keyof typeof TMDB_IMAGE_SIZES | string = 'w500'
  ): string => {
    if (!path) return '/placeholder-movie.jpg';
    
    // Use predefined size or fallback to provided string
    const imageSize = TMDB_IMAGE_SIZES[size as keyof typeof TMDB_IMAGE_SIZES] || size;
    return `https://image.tmdb.org/t/p/${imageSize}${path}`;
  };

  // Check if item is in watchlist/liked on mount
  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(movie.id, 'movie'));
    setIsLiked(likedStorage.isLiked(movie.id, 'movie'));
  }, [movie.id]);

  // Handle watchlist toggle
  const toggleWatchlist = () => {
    const item = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      media_type: 'movie' as const,
      vote_average: movie.vote_average || 0,
      release_date: movie.release_date
    };

    if (isInWatchlist) {
      watchlistStorage.removeFromWatchlist(movie.id, 'movie');
      setIsInWatchlist(false);
    } else {
      watchlistStorage.addToWatchlist(item);
      setIsInWatchlist(true);
    }
    
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  // Handle like toggle
  const toggleLike = () => {
    const item = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      media_type: 'movie' as const,
      vote_average: movie.vote_average || 0,
      release_date: movie.release_date
    };

    if (isLiked) {
      likedStorage.removeFromLiked(movie.id, 'movie');
      setIsLiked(false);
    } else {
      likedStorage.addToLiked(item);
      setIsLiked(true);
    }
    
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  // Get movie genres
  const movieGenres = genres?.filter(genre => 
    movie.genre_ids?.includes(genre.id) || movie.genres?.some(g => g.id === genre.id)
  ) || movie.genres || [];

  // Get trailer video
  const trailer = movie.videos?.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube'
  ) || movie.videos?.results?.[0];

  // Get cast members
  const cast = movie.credits?.cast?.slice(0, 12) || [];
  
  // Get crew (director, producer, etc.)
  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const producer = movie.credits?.crew?.find(person => person.job === 'Producer');

  // Format runtime
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Background with Backdrop - Using direct TMDB URL */}
      <div className="absolute inset-0">
        <Image
          src={buildTmdbImage(movie.backdrop_path, 'backdrop')}
          alt={`${movie.title} backdrop`}
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      {/* Back Button */}
      <div className="relative z-10 p-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Poster - Using direct TMDB URL */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto lg:mx-0">
                <Image
                  src={buildTmdbImage(movie.poster_path, 'posterLarge')}
                  alt={`${movie.title} poster`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={90}
                />
              </div>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2">
              {/* Title and Basic Info */}
              <div className="mb-6">
                <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
                  {movie.title}
                </h1>
                
                {movie.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">{movie.tagline}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {movie.release_date && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  
                  {movie.runtime && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}

                  {movie.spoken_languages?.[0] && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <Globe className="w-4 h-4" />
                      <span>{movie.spoken_languages[0].english_name}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movieGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movieGenres.slice(0, 4).map(genre => (
                      <span 
                        key={genre.id}
                        className="bg-blue-600/80 text-blue-100 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                {/* Watch Now Button */}
                <Link
                  href={`/watch/movie/${movie.id}`}
                  className="flex items-center gap-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Watch Now
                </Link>
                
                {trailer && (
                  <button 
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-3 bg-gray-700/80 hover:bg-gray-700 px-6 py-4 rounded-full font-semibold transition-all hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Play Trailer
                  </button>
                )}
                
                <button 
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-3 px-6 py-4 rounded-full font-semibold transition-all hover:scale-105 ${
                    isInWatchlist 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-700/80 hover:bg-gray-700'
                  }`}
                  aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  <Plus className="w-5 h-5" />
                  {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                </button>
                
                <button 
                  onClick={toggleLike}
                  className={`p-4 rounded-full transition-all hover:scale-105 ${
                    isLiked 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-700/80 hover:bg-gray-700'
                  }`}
                  aria-label={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Overview */}
              {movie.overview && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Overview</h2>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {director && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Director</h3>
                    <p className="text-white">{director.name}</p>
                  </div>
                )}
                
                {producer && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Producer</h3>
                    <p className="text-white">{producer.name}</p>
                  </div>
                )}
                
                {movie.budget > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Budget</h3>
                    <p className="text-white">{formatCurrency(movie.budget)}</p>
                  </div>
                )}
                
                {movie.revenue > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Revenue</h3>
                    <p className="text-white">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}

                {movie.status && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Status</h3>
                    <p className="text-white">{movie.status}</p>
                  </div>
                )}

                {movie.original_language && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Original Language</h3>
                    <p className="text-white uppercase">{movie.original_language}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cast Section - Using direct TMDB URLs */}
          {cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cast.map((person) => (
                  <div key={person.id} className="text-center group">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={buildTmdbImage(person.profile_path, 'profile')}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{person.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Movies - Using direct TMDB URLs */}
          {movie.similar?.results?.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {movie.similar.results.slice(0, 12).map((similarMovie) => (
                  <Link 
                    key={similarMovie.id} 
                    href={`/movie/${similarMovie.id}`}
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={buildTmdbImage(similarMovie.poster_path, 'w500')}
                        alt={similarMovie.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                      {similarMovie.title}
                    </h3>
                    {similarMovie.vote_average > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-gray-400">{similarMovie.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative w-full max-w-6xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 z-10 bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close trailer"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setTrailerMuted(!trailerMuted)}
              className="absolute top-4 left-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label={trailerMuted ? 'Unmute' : 'Mute'}
            >
              {trailerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${trailerMuted ? 1 : 0}&rel=0`}
              title={`${movie.title} Trailer`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

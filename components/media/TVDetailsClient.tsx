"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Plus,
  Heart,
  Star,
  Calendar,
  Tv,
  ArrowLeft,
  Volume2,
  VolumeX,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { MediaDetails, Genre } from "@/lib/api/types";
import { watchlistStorage, likedStorage } from "@/lib/storage/watchlist";

interface Season {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episode_count: number;
  episodes?: Episode[];
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string;
  runtime: number;
  still_path: string | null;
  vote_average: number;
}

interface TVDetailsClientProps {
  tv: MediaDetails;
  genres: Genre[];
  seasons?: Season[];
}

// ✅ TMDB Image size constants
const TMDB_IMAGE_SIZES = {
  backdrop: 'w1280',
  poster: 'w500',
  posterLarge: 'w780',
  profile: 'w185',
  still: 'w300',
  original: 'original',
} as const;

export default function TvShowDetailsClient({ tv, genres, seasons = [] }: TVDetailsClientProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set([1])); // Season 1 expanded by default

  // ✅ Build TMDB image URLs directly (no API key needed)
  const buildTmdbImage = (
    path: string | null | undefined,
    size: keyof typeof TMDB_IMAGE_SIZES | string = "w500"
  ): string => {
    if (!path) return "/placeholder-movie.jpg";
    
    const imageSize = TMDB_IMAGE_SIZES[size as keyof typeof TMDB_IMAGE_SIZES] || size;
    return `https://image.tmdb.org/t/p/${imageSize}${path}`;
  };

  // Sync liked & watchlist state
  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(tv.id, "tv"));
    setIsLiked(likedStorage.isLiked(tv.id, "tv"));
  }, [tv.id]);

  // Handle watchlist toggle
  const toggleWatchlist = () => {
    const item = {
      id: tv.id,
      name: tv.name,
      poster_path: tv.poster_path,
      media_type: "tv" as const,
      vote_average: tv.vote_average || 0,
      first_air_date: tv.first_air_date,
    };

    if (isInWatchlist) {
      watchlistStorage.removeFromWatchlist(tv.id, "tv");
      setIsInWatchlist(false);
    } else {
      watchlistStorage.addToWatchlist(item);
      setIsInWatchlist(true);
    }

    window.dispatchEvent(new CustomEvent("watchlist-updated"));
  };

  // Handle like toggle
  const toggleLike = () => {
    const item = {
      id: tv.id,
      name: tv.name,
      poster_path: tv.poster_path,
      media_type: "tv" as const,
      vote_average: tv.vote_average || 0,
      first_air_date: tv.first_air_date,
    };

    if (isLiked) {
      likedStorage.removeFromLiked(tv.id, "tv");
      setIsLiked(false);
    } else {
      likedStorage.addToLiked(item);
      setIsLiked(true);
    }

    window.dispatchEvent(new CustomEvent("liked-updated"));
  };

  // Toggle season expansion
  const toggleSeason = (seasonNumber: number) => {
    const newExpanded = new Set(expandedSeasons);
    if (newExpanded.has(seasonNumber)) {
      newExpanded.delete(seasonNumber);
    } else {
      newExpanded.add(seasonNumber);
    }
    setExpandedSeasons(newExpanded);
  };

  // Format episode runtime
  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format air date
  const formatAirDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get genres
  const tvGenres = genres?.filter(
    (genre) =>
      tv.genre_ids?.includes(genre.id) ||
      tv.genres?.some((g) => g.id === genre.id)
  ) || tv.genres || [];

  // Get trailer
  const trailer = tv.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  ) || tv.videos?.results?.[0];

  // Get cast
  const cast = tv.credits?.cast?.slice(0, 12) || [];

  // Get creator
  const creator = tv.created_by?.[0] || tv.credits?.crew?.find((p) => p.job === "Creator");

  // Filter out specials and sort seasons
  const regularSeasons = seasons
    .filter(season => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  return (
    <div className="relative min-h-screen text-white">
      {/* Background with Backdrop - Using direct TMDB URL */}
      <div className="absolute inset-0">
        <Image
          src={buildTmdbImage(tv.backdrop_path, "backdrop")}
          alt={`${tv.name} backdrop`}
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
                  src={buildTmdbImage(tv.poster_path, "posterLarge")}
                  alt={`${tv.name} poster`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={90}
                />
              </div>
            </div>

            {/* TV Show Info */}
            <div className="lg:col-span-2">
              {/* Title and Basic Info */}
              <div className="mb-6">
                <h1 className="text-4xl lg:text-6xl font-black mb-4 leading-tight">
                  {tv.name}
                </h1>

                {tv.tagline && (
                  <p className="text-xl text-gray-300 italic mb-4">
                    {tv.tagline}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {tv.vote_average > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{tv.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {tv.first_air_date && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tv.first_air_date).getFullYear()}</span>
                    </div>
                  )}

                  {tv.number_of_seasons && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <Tv className="w-4 h-4" />
                      <span>
                        {tv.number_of_seasons} Season
                        {tv.number_of_seasons !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {tv.status && (
                    <div className="flex items-center gap-1 bg-gray-700/70 px-3 py-1 rounded-full">
                      <span>{tv.status}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {tvGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tvGenres.slice(0, 4).map((genre) => (
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
                {/* Watch Now Button - Links to first episode */}
                <Link
                  href={`/watch/tv/${tv.id}?season=1&episode=1`}
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
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-700/80 hover:bg-gray-700"
                  }`}
                  aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Plus className="w-5 h-5" />
                  {isInWatchlist ? "In Watchlist" : "Watchlist"}
                </button>

                <button
                  onClick={toggleLike}
                  className={`p-4 rounded-full transition-all hover:scale-105 ${
                    isLiked
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-700/80 hover:bg-gray-700"
                  }`}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Overview */}
              {tv.overview && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Overview</h2>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {tv.overview}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {creator && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Creator</h3>
                    <p className="text-white">{creator.name}</p>
                  </div>
                )}

                {tv.networks?.[0] && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Network</h3>
                    <p className="text-white">{tv.networks[0].name}</p>
                  </div>
                )}

                {tv.number_of_episodes && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Total Episodes</h3>
                    <p className="text-white">{tv.number_of_episodes}</p>
                  </div>
                )}

                {tv.episode_run_time?.[0] && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Episode Runtime</h3>
                    <p className="text-white">{tv.episode_run_time[0]} min</p>
                  </div>
                )}

                {tv.last_air_date && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Last Aired</h3>
                    <p className="text-white">{formatAirDate(tv.last_air_date)}</p>
                  </div>
                )}

                {tv.type && (
                  <div>
                    <h3 className="font-semibold text-gray-400 mb-2">Type</h3>
                    <p className="text-white">{tv.type}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seasons & Episodes */}
          {regularSeasons.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Seasons & Episodes</h2>
              <div className="space-y-6">
                {regularSeasons.map((season) => (
                  <div key={season.id} className="bg-gray-900/50 rounded-xl p-6 backdrop-blur-sm">
                    <button
                      onClick={() => toggleSeason(season.season_number)}
                      className="w-full flex items-center justify-between mb-4 hover:text-gray-300 transition-colors"
                      aria-label={`Toggle ${season.name}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          <Image
                            src={buildTmdbImage(season.poster_path, "w200")}
                            alt={season.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">{season.name}</h3>
                          <p className="text-gray-400 text-sm">
                            {season.episode_count} episodes • {formatAirDate(season.air_date)}
                          </p>
                        </div>
                      </div>
                      {expandedSeasons.has(season.season_number) ? (
                        <ChevronUp className="w-6 h-6 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 flex-shrink-0" />
                      )}
                    </button>

                    {expandedSeasons.has(season.season_number) && season.episodes && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {season.episodes.map((episode) => (
                          <Link
                            key={episode.id}
                            href={`/watch/tv/${tv.id}?season=${season.season_number}&episode=${episode.episode_number}`}
                            className="group bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex gap-4">
                              <div className="relative w-24 h-14 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                                <Image
                                  src={buildTmdbImage(episode.still_path, "still")}
                                  alt={episode.name}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-gray-400 text-sm font-medium">
                                    E{episode.episode_number}
                                  </span>
                                  {episode.vote_average > 0 && (
                                    <span className="text-yellow-400 text-sm flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-current" />
                                      {episode.vote_average.toFixed(1)}
                                    </span>
                                  )}
                                  {episode.runtime && (
                                    <span className="text-gray-400 text-sm flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatRuntime(episode.runtime)}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-white">
                                  {episode.name}
                                </h4>
                                {episode.overview && (
                                  <p className="text-gray-400 text-xs line-clamp-2">
                                    {episode.overview}
                                  </p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                  {formatAirDate(episode.air_date)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cast Section - Using direct TMDB URLs */}
          {cast.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cast.map((person) => (
                  <div key={person.id} className="text-center group">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={buildTmdbImage(person.profile_path, "profile")}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {person.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-1">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar TV Shows - Using direct TMDB URLs */}
          {tv.similar?.results?.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-8">Similar TV Shows</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {tv.similar.results.slice(0, 12).map((similarShow) => (
                  <Link 
                    key={similarShow.id} 
                    href={`/tv/${similarShow.id}`} 
                    className="group"
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gray-800 group-hover:scale-105 transition-transform duration-200">
                      <Image
                        src={buildTmdbImage(similarShow.poster_path, "w500")}
                        alt={similarShow.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                      {similarShow.name}
                    </h3>
                    {similarShow.vote_average > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs text-gray-400">{similarShow.vote_average.toFixed(1)}</span>
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
              aria-label={trailerMuted ? "Unmute" : "Mute"}
            >
              {trailerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${
                trailerMuted ? 1 : 0
              }&rel=0`}
              title={`${tv.name} Trailer`}
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

// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://api.cinezo.net/media/tmdb-movie-${id}", label: "Cinezo" },
  { url: "https://www.vidking.net/embed/movie/${id}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true", label: "vidme" },
  { url: "https://bidsrc.pro/movie/${id}?autoplay=true", label: "vidzy" },
  { url: "https://fmovies4u.net/embed/tmdb-movie-${id}?theme=16A085&hideServer=true&autoPlay=true&sub=en&nextButton=true&autoNext=true&title=false", label: "Vidly" }
  
];

export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const sources = PROVIDERS.map(p => ({
    url: p.url.replace(/\$\{id\}/g, String(id)),
    label: p.label
  }));

  // Default to first source
  return {
    embedUrl: sources[0].url,
    provider: sources[0].label,
    allSources: sources
  };
}

export default { getMovieEmbed };

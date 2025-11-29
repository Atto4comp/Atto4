// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://fmovies4u.com/embed/tmdb-movie-${id}?theme=16A085&hideServer=true&autoPlay=true&sub=en&nextButton=true&autoNext=true", label: "Vidly" },
  { url: "https://bidsrc.pro/embed/movie/${id}?autoplay=true", label: "vidzy" },
  { url: "https://vidfast.to/embed/movie/${id}", label: "Vidme" }
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

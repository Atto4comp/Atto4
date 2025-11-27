// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}", label: "Atto4" },
  { url: "https://vidsrc.me/embed/movie?tmdb=${id}", label: "VidSrc Me" },
  { url: "https://vidbinge.com/embed/movie/${id}", label: "VidBinge" },
  { url: "https://www.2embed.cc/embed/${id}", label: "2Embed" },
  { url: "https://superembed.stream/embed/movie/${id}", label: "SuperEmbed" }
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

/**
 * scripts/fetch-homepage.js
 * Usage: TMDB_API_KEY=xxxxx node scripts/fetch-homepage.js
 * Writes data/homepage.json
 */
import fs from 'fs/promises';
import path from 'path';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error('TMDB_API_KEY is required (export TMDB_API_KEY=...)');
  process.exit(1);
}

async function tmdbFetch(pathname, params = {}) {
  const url = new URL(`${TMDB_BASE}${pathname}`);
  const sp = new URLSearchParams({ api_key: API_KEY });
  Object.entries(params).forEach(([k, v]) => { if (v != null) sp.set(k, String(v)); });
  url.search = sp.toString();
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status}: ${txt}`);
  }
  return res.json();
}

(async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const endpoints = [
      tmdbFetch('/trending/movie/week'),
      tmdbFetch('/movie/popular', { page: 1 }),
      tmdbFetch('/movie/top_rated', { page: 1 }),
      tmdbFetch('/discover/movie', { sort_by: 'release_date.desc', 'vote_count.gte': 10, 'release_date.lte': today, page: 1 }),
      tmdbFetch('/tv/popular', { page: 1 }),
      tmdbFetch('/tv/top_rated', { page: 1 }),
      tmdbFetch('/genre/movie/list'),
    ];

    const settled = await Promise.allSettled(endpoints);
    const safe = (p, fallback) => p.status === 'fulfilled' ? p.value : fallback;

    const snapshot = {
      generatedAt: new Date().toISOString(),
      trending: (safe(settled[0], { results: [] }).results || []).slice(0, 20),
      popular: safe(settled[1], { results: [] }).results || [],
      topRated: safe(settled[2], { results: [] }).results || [],
      latest: safe(settled[3], { results: [] }).results || [],
      popularTV: safe(settled[4], { results: [] }).results || [],
      topRatedTV: safe(settled[5], { results: [] }).results || [],
      genres: (safe(settled[6], { genres: [] }).genres) || [],
      source: 'snapshot',
    };

    const outDir = path.join(process.cwd(), 'data');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'homepage.json'), JSON.stringify(snapshot, null, 2), 'utf8');
    console.log('Wrote data/homepage.json');
  } catch (err) {
    console.error('fetch-homepage failed:', err);
    process.exit(2);
  }
})();

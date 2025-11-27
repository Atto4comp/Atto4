/**
 * scripts/fetch-movies.js
 * Usage: TMDB_API_KEY=xxxxx MOVIES_LIMIT=80 node scripts/fetch-movies.js
 * Writes data/movies/<id>.json
 */
import fs from 'fs/promises';
import path from 'path';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;
if (!API_KEY) {
  console.error('TMDB_API_KEY is required (export TMDB_API_KEY=...)');
  process.exit(1);
}

function buildUrl(p, params = {}) {
  const url = new URL(`${TMDB_BASE}${p}`);
  const sp = new URLSearchParams({ api_key: API_KEY });
  Object.entries(params).forEach(([k, v]) => { if (v != null) sp.set(k, String(v)); });
  url.search = sp.toString();
  return url.toString();
}

async function tmdbFetch(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status}: ${txt}`);
  }
  return res.json();
}

(async () => {
  try {
    // Fetch a list of candidate movie ids (popular + top rated)
    const [pop, top] = await Promise.all([
      tmdbFetch(buildUrl('/movie/popular', { page: 1 })),
      tmdbFetch(buildUrl('/movie/top_rated', { page: 1 })),
    ]);

    const ids = Array.from(new Set([...(pop.results || []).map(r => r.id), ...(top.results || []).map(r => r.id)]));
    const limit = Number(process.env.MOVIES_LIMIT || 100);
    const selected = ids.slice(0, limit);

    console.log('Snapshotting', selected.length, 'movies');
    const outDir = path.join(process.cwd(), 'data', 'movies');
    await fs.mkdir(outDir, { recursive: true });

    for (const id of selected) {
      try {
        const url = buildUrl(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations', language: 'en-US' });
        const data = await tmdbFetch(url);
        await fs.writeFile(path.join(outDir, `${id}.json`), JSON.stringify({ movie: data, generatedAt: new Date().toISOString() }, null, 2), 'utf8');
        console.log('Wrote movie', id);
      } catch (e) {
        console.warn('Skipping movie', id, 'error:', e.message || e);
      }
    }

    console.log('Done snapshotting movies.');
  } catch (err) {
    console.error('fetch-movies failed:', err);
    process.exit(2);
  }
})();

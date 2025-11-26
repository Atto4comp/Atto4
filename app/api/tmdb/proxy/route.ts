// app/api/tmdb/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL!; // e.g. Redis Cloud / Upstash URL
const redis = new Redis(REDIS_URL);

const TMDB_BASE = 'https://api.themoviedb.org/3';

const CACHE_TTL = 60 * 5; // 5 minutes — adjust as needed

// Helper: build TMDB API URL
function buildTmdbUrl(path: string, params: Record<string, any>) {
  const url = new URL(`${TMDB_BASE}${path}`);
  const search = new URLSearchParams({ api_key: process.env.TMDB_API_KEY! });
  for (const [k, v] of Object.entries(params)) {
    if (v != null) search.set(k, String(v));
  }
  url.search = search.toString();
  return url.toString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams, pathname } = new URL(req.url);
    // e.g. pathname: '/api/tmdb/proxy/search' or '/api/tmdb/proxy/movie/123'
    const tmdbPath = pathname.replace('/api/tmdb/proxy', '');

    // derive cache key: path + sorted params
    const params: Record<string, any> = {};
    searchParams.forEach((v, k) => {
      params[k] = v;
    });
    const cacheKey = `tmdb:${tmdbPath}:${JSON.stringify(params)}`;

    // try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // fetch from TMDB
    const url = buildTmdbUrl(tmdbPath, params);
    const tmdbRes = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!tmdbRes.ok) {
      return NextResponse.json(
        { error: 'TMDB error', status: tmdbRes.status, body: await tmdbRes.text() },
        { status: tmdbRes.status }
      );
    }

    const data = await tmdbRes.json();

    // cache it (with TTL)
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(data));

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('TMDB proxy/cache error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

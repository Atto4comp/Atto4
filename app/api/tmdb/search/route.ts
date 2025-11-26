// app/api/tmdb/proxy/[...tmdbPath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const { TMDB_API_KEY } = process.env;

// Upstash: reads UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const DEFAULT_CACHE_TTL = 60 * 5; // seconds

function sortedParamsKey(searchParams: URLSearchParams) {
  const entries = Array.from(searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

function buildTmdbUrlFromPath(tmdbPath: string, searchParams: URLSearchParams) {
  // tmdbPath must start with '/'
  const normalizedPath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
  const url = new URL(`${TMDB_BASE}${normalizedPath}`);

  const params = new URLSearchParams();
  // attach server-side API key
  if (!TMDB_API_KEY) throw new Error('Missing TMDB_API_KEY in server environment');

  params.set('api_key', TMDB_API_KEY);

  // copy incoming query params (do not allow client to override api_key)
  for (const [k, v] of searchParams) {
    if (k === 'api_key') continue;
    params.set(k, v);
  }

  url.search = params.toString();
  return url.toString();
}

export async function GET(req: NextRequest) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'Server misconfigured: TMDB_API_KEY missing' }, { status: 500 });
    }

    // req.nextUrl is safer in App Router
    const nextUrl = req.nextUrl;
    // path after /api/tmdb/proxy
    // nextUrl.pathname might be '/api/tmdb/proxy/search/multi' etc.
    const prefix = '/api/tmdb/proxy';
    const pathname = nextUrl.pathname;
    let tmdbPath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';
    if (!tmdbPath) {
      return NextResponse.json(
        { error: 'Missing TMDB path. Use /api/tmdb/proxy/<tmdb_path>?params...' },
        { status: 400 }
      );
    }
    // ensure leading slash
    if (!tmdbPath.startsWith('/')) tmdbPath = `/${tmdbPath}`;

    // collect and canonicalize params for cache key
    const searchParams = nextUrl.searchParams;
    const cacheKey = `tmdb:${tmdbPath}:${sortedParamsKey(searchParams)}`;

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        // cached from Upstash is a string; return parsed
        return NextResponse.json(JSON.parse(cached), {
          headers: { 'X-Cache': 'HIT' },
        });
      }
    } catch (rerr) {
      // Redis may fail — just log and continue to fetch external
      console.warn('Upstash get error (continuing):', rerr);
    }

    // Build TMDB URL (server attaches API key)
    const tmdbUrl = buildTmdbUrlFromPath(tmdbPath, searchParams);

    // Fetch TMDB
    const tmdbRes = await fetch(tmdbUrl, { headers: { Accept: 'application/json' } });

    if (!tmdbRes.ok) {
      const text = await tmdbRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'TMDB responded with error', status: tmdbRes.status, body: text },
        { status: tmdbRes.status }
      );
    }

    const data = await tmdbRes.json();

    // Cache response (best-effort)
    try {
      // store as string; Upstash set accepts TTL via ex = seconds
      await redis.set(cacheKey, JSON.stringify(data), { ex: DEFAULT_CACHE_TTL });
    } catch (rerr) {
      console.warn('Upstash set error (non-fatal):', rerr);
    }

    return NextResponse.json(data, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (err: any) {
    console.error('TMDB proxy error:', err);
    const message = err?.message ?? 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}


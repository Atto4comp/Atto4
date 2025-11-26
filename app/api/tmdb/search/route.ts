// app/api/tmdb/proxy/[...tmdbPath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

/**
 * IMPORTANT:
 * - This file will try to read Upstash credentials from env vars first:
 *     UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * - If they are not present (local dev), it will fall back to the
 *   hardcoded values provided below. You can remove the hardcoded
 *   defaults after you verify deployment.
 *
 * NOTE: Do NOT commit your real credentials to a public repo. Prefer using Vercel
 * environment variables in production. This file keeps a fallback for ease of testing.
 */

// --- FALLBACK / PROVIDED CREDENTIALS (used only if env vars absent) ---
const FALLBACK_UPSTASH_URL = 'https://thorough-redbird-13963.upstash.io';
const FALLBACK_UPSTASH_TOKEN = 'AjaLAAIgcDJ8atg_XXYsVytOVL8-0g2m2i2rc5RuBqYp-CeFUP7rCA';

// Use env first; otherwise use provided fallbacks.
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || FALLBACK_UPSTASH_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || FALLBACK_UPSTASH_TOKEN;

// Construct Redis client. Redis.fromEnv() prefers env vars but we create explicitly to allow fallbacks.
const redis = new Redis({
  url: upstashUrl,
  token: upstashToken,
});

const { TMDB_API_KEY } = process.env;
const CACHE_TTL_SECONDS = Number(process.env.TMDB_CACHE_TTL ?? 300); // default 5 minutes

const TMDB_BASE = 'https://api.themoviedb.org/3';

function sortedParamsKey(searchParams: URLSearchParams) {
  const entries = Array.from(searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

/**
 * Build the TMDB URL from the captured path and incoming query params.
 * Server attaches TMDB_API_KEY and prevents the client from overriding it.
 */
function buildTmdbUrlFromPath(tmdbPath: string, searchParams: URLSearchParams) {
  const normalizedPath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
  const url = new URL(`${TMDB_BASE}${normalizedPath}`);

  const params = new URLSearchParams();
  if (!TMDB_API_KEY) throw new Error('Missing TMDB_API_KEY in server environment');
  params.set('api_key', TMDB_API_KEY);

  for (const [k, v] of searchParams) {
    if (k === 'api_key') continue; // never trust client-provided api_key
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

    const nextUrl = req.nextUrl;
    const prefix = '/api/tmdb/proxy';
    const pathname = nextUrl.pathname;

    // e.g. incoming /api/tmdb/proxy/search/multi -> tmdbPath = /search/multi
    let tmdbPath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';
    if (!tmdbPath) {
      return NextResponse.json(
        { error: 'Missing TMDB path. Use /api/tmdb/proxy/<tmdb_path>?params...' },
        { status: 400 }
      );
    }

    // ensure leading slash and decode
    tmdbPath = tmdbPath.startsWith('/') ? tmdbPath : `/${tmdbPath}`;
    try {
      tmdbPath = decodeURIComponent(tmdbPath);
    } catch {
      // ignore decode errors; keep original tmdbPath
    }

    // Safety: reject attempts at path traversal
    if (tmdbPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid TMDB path' }, { status: 400 });
    }

    const searchParams = nextUrl.searchParams;
    const cacheKey = `tmdb:${encodeURIComponent(tmdbPath)}:${encodeURIComponent(sortedParamsKey(searchParams))}`;

    // HEAD check support (quick probe for proxy availability)
    if (req.method === 'HEAD') {
      return new NextResponse(null, { status: 200 });
    }

    // Try cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json(parsed, { headers: { 'X-Cache': 'HIT' } });
      }
    } catch (rerr) {
      // non-fatal: log & continue
      console.warn('Upstash GET error (continuing):', rerr);
    }

    // Build and call TMDB URL
    const tmdbUrl = buildTmdbUrlFromPath(tmdbPath, searchParams);
    const tmdbRes = await fetch(tmdbUrl, { headers: { Accept: 'application/json' } });

    if (!tmdbRes.ok) {
      const bodyText = await tmdbRes.text().catch(() => '');
      return NextResponse.json(
        { error: 'TMDB responded with error', status: tmdbRes.status, body: bodyText },
        { status: tmdbRes.status }
      );
    }

    const data = await tmdbRes.json();

    // Best-effort cache write
    try {
      await redis.set(cacheKey, JSON.stringify(data), { ex: CACHE_TTL_SECONDS });
    } catch (rerr) {
      console.warn('Upstash SET error (non-fatal):', rerr);
    }

    return NextResponse.json(data, { headers: { 'X-Cache': 'MISS' } });
  } catch (err: any) {
    console.error('TMDB proxy error:', err);
    const message = err?.message ?? 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}

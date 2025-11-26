// app/api/tmdb/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TMDB_SEARCH_PATH = 'https://api.themoviedb.org/3/search/multi';
const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

/**
 * Helper: perform fetch with timeout and minimal retry logic.
 */
async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Build TMDB search URL with standard params.
 */
function buildTmdbSearchUrl(query: string, page?: string | null, language = 'en-US', include_adult = 'false') {
  const params = new URLSearchParams();
  params.set('query', query);
  if (page) params.set('page', page);
  if (language) params.set('language', language);
  if (include_adult) params.set('include_adult', include_adult);
  // api_key is appended server-side in the proxy; keep it out of client URLs
  return `${TMDB_SEARCH_PATH}?${params.toString()}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? searchParams.get('query') ?? '';
    const page = searchParams.get('page') ?? undefined;
    const language = searchParams.get('language') ?? 'en-US';
    const include_adult = searchParams.get('include_adult') ?? 'false';

    // Mirror original behaviour: if no query, return empty results (helpful for callers)
    if (!query || !query.trim()) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const apiKey = (process.env.NEXT_PUBLIC_TMDB_API_KEY || '').trim();
    if (!apiKey) {
      return NextResponse.json({ error: 'Server misconfigured: missing TMDB API key' }, { status: 500 });
    }

    const url = buildTmdbSearchUrl(query, page, language, include_adult);
    const fullUrl = `${url}&api_key=${encodeURIComponent(apiKey)}`;

    let lastErr: any = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetchWithTimeout(fullUrl, {
          headers: { Accept: 'application/json' },
        });

        // If TMDB returns rate-limit or server error, surface it to client with the status
        if (!res.ok) {
          // For 401/403/404 return the TMDB status so caller can handle
          const text = await safeReadBody(res);
          return NextResponse.json(
            { error: 'TMDB error', status: res.status, body: text?.slice(0, 500) ?? null },
            { status: res.status }
          );
        }

        const data = await res.json();

        // Short-lived CDN caching: search is dynamic, but this reduces repeated identical calls
        const headers = {
          // Keep HTML/edge caches from storing for long. s-maxage small lets CDN serve identical repeats briefly.
          'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60',
        };

        return NextResponse.json(data, { status: 200, headers });
      } catch (err: any) {
        lastErr = err;
        const isAbort = err?.name === 'AbortError';
        const isNetwork = err?.code === 'ENOTFOUND' || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';

        // If it's the last attempt, break and return error below
        if (attempt === MAX_RETRIES) break;

        // small backoff before retrying
        const backoff = Math.pow(2, attempt - 1) * 250;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, backoff));
        // try again
      }
    }

    // If we reach here, all retries failed
    console.error('TMDB search proxy failure:', lastErr);
    return NextResponse.json(
      { error: 'Failed to fetch search results from TMDB' },
      { status: 502 }
    );
  } catch (err) {
    console.error('TMDB search proxy error (unexpected):', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Safely read small response body for error messages.
 */
async function safeReadBody(res: Response) {
  try {
    const txt = await res.text();
    return txt.length > 1000 ? `${txt.slice(0, 1000)}...` : txt;
  } catch {
    return null;
  }
}

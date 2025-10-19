import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { fetchWithBrowserSafe } from '@/lib/browser-proxy';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !/^https:\/\//i.test(url)) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'rl-browser',
  });
}
const ratelimit = getRatelimit();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ no Promise here
) {
  const { id } = params;

  if (!id || Number.isNaN(Number(id))) {
    return new NextResponse('Invalid movie ID', { status: 400 });
  }

  if (ratelimit) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.ip || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  const upstreamUrl =
    `https://iframe.pstream.mov/embed/tmdb-movie-${id}` +
    `?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;

  // 1) Try headless (if enabled); 2) else plain fetch; 3) return best message
  // ---- headless try
  const headless = await fetchWithBrowserSafe({
    url: upstreamUrl,
    timeout: 30000,
    waitForSelector: 'video, iframe, .player',
  });

  if (!headless.error && headless.html) {
    let html = injectBaseAndDefang(headless.html, upstreamUrl);
    return okHtml(html);
  }

  // ---- fallback: plain fetch + rewrite
  try {
    const resp = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': BACKLINK,
        'Origin': BACKLINK.replace(/\/$/, ''),
      },
      // no cache
      cache: 'no-store',
    });

    const htmlRaw = await resp.text();
    if (!resp.ok) return notAvailable(id, resp.status);

    // Provider sometimes serves a “Not found” HTML with 200 — check content
    const lower = htmlRaw.toLowerCase();
    if (lower.includes('couldn\'t find that page') || lower.includes('not found')) {
      return notFoundPretty(`Movie ${id} not found on provider.`);
    }

    const html = injectBaseAndDefang(htmlRaw, upstreamUrl);
    return okHtml(html);
  } catch (e: any) {
    return errorPretty(e?.message || 'Failed to fetch upstream');
  }
}

/* helpers */
function injectBaseAndDefang(html: string, upstreamUrl: string) {
  const origin = new URL(upstreamUrl).origin;
  const baseTag = `<base href="${origin}/">`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${baseTag}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, `<html$1>\n<head>${baseTag}</head>`);
  } else {
    html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
  }
  // kill frame-busters (best-effort)
  return html
    .replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)')
    .replace(/top\.location\s*=/gi, '// top.location =')
    .replace(/parent\.location\s*=/gi, '// parent.location =');
}

function okHtml(html: string) {
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "frame-ancestors 'self'",
      'Cache-Control': 'no-store',
    },
  });
}
function notAvailable(id: string, status: number) {
  return new NextResponse(
    `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
      <div style="text-align:center">
        <h2>Movie Not Available</h2>
        <p>Movie ID ${id} is not available. (${status})</p>
      </div>
    </body></html>`,
    { status, headers: { 'Content-Type': 'text/html' } }
  );
}
function notFoundPretty(msg: string) {
  return new NextResponse(
    `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
      <div style="text-align:center"><h2>Not Found</h2><p>${msg}</p></div>
    </body></html>`,
    { status: 404, headers: { 'Content-Type': 'text/html' } }
  );
}
function errorPretty(msg: string) {
  return new NextResponse(
    `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
      <div style="text-align:center"><h2>Failed to Load Movie</h2><p>${msg}</p></div>
    </body></html>`,
    { status: 500, headers: { 'Content-Type': 'text/html' } }
  );
}

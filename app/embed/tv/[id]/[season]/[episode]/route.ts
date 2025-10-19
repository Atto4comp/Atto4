import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro';

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !/^https:\/\//i.test(url)) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'rl',
  });
}
const ratelimit = getRatelimit();

function ipOf(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.ip || 'anonymous';
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

function buildUpstreamUrl(id: string, s: string, e: string) {
  return `https://iframe.pstream.mov/embed/tmdb-tv-${encodeURIComponent(id)}/${encodeURIComponent(
    s
  )}/${encodeURIComponent(
    e
  )}?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;
}

function injectBase(html: string, origin: string) {
  const baseTag = `<base href="${origin}/">`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  }
  return `<head>${baseTag}</head>${html}`;
}

function defangFrameBust(html: string) {
  return html
    .replace(
      /if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi,
      '/* removed */'
    )
    .replace(/top\.location\s*=/gi, '// top.location =');
}

async function fetchVariant(url: string, variant: 'site' | 'upstream') {
  const origin = new URL(url).origin;
  const hdrsSite = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: `${BACKLINK}/`,
    Origin: BACKLINK,
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
  };
  const hdrsUpstream = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: `${origin}/`,
    Origin: origin,
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
  };
  return fetch(url, { headers: variant === 'site' ? hdrsSite : hdrsUpstream });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; season: string; episode: string } }
) {
  const { id, season, episode } = params;

  if (ratelimit) {
    const { success } = await ratelimit.limit(ipOf(request));
    if (!success) return new NextResponse('Too many requests', { status: 429 });
  }

  try {
    const upstreamUrl = buildUpstreamUrl(id, season, episode);
    const origin = new URL(upstreamUrl).origin;

    let res = await fetchVariant(upstreamUrl, 'site');
    if (!res.ok && (res.status === 403 || res.status === 404)) {
      res = await fetchVariant(upstreamUrl, 'upstream');
    }
    if (!res.ok) {
      return new NextResponse(
        `Upstream error: ${res.status} ${res.statusText}`,
        { status: 502 }
      );
    }

    let html = await res.text();
    html = injectBase(html, origin);
    html = defangFrameBust(html);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `frame-ancestors 'self'`,
        'Cache-Control': 'no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (e) {
    console.error('TV Proxy error:', e);
    return new NextResponse(
      '<html><body style="background:#000;color:#fff;text-align:center;padding:2rem">Failed to load video</body></html>',
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

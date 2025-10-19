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
    prefix: 'rl-embed-tv',
  });
}
const ratelimit = getRatelimit();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; season: string; episode: string }> }
) {
  const { id, season, episode } = await context.params;

  if (
    !id ||
    !season ||
    !episode ||
    Number.isNaN(Number(id)) ||
    Number.isNaN(Number(season)) ||
    Number.isNaN(Number(episode))
  ) {
    return new NextResponse('Invalid parameters', { status: 400 });
  }

  if (ratelimit) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.ip || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  const baseUrl = `https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}`;
  const upstreamUrl = `${baseUrl}?` + new URLSearchParams({
    logo: 'false',
    tips: 'false',
    theme: 'default',
    allinone: 'true',
    backlink: BACKLINK,
  }).toString();

  // 1) Try headless browser first (if enabled)
  const browserRes = await fetchWithBrowserSafe({
    url: upstreamUrl,
    timeout: 30000,
    waitForSelector: 'video, iframe, .player',
  });

  if (browserRes.status !== 501 && browserRes.html) {
    const html = postProcessHtml(browserRes.html, upstreamUrl);
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  }

  // 2) Fallback to regular fetch
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const resp = await fetch(upstreamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': BACKLINK,
        'Origin': BACKLINK.replace(/\/$/, ''),
      },
      signal: controller.signal,
      cache: 'no-store',
    }).finally(() => clearTimeout(timeoutId));

    if (!resp.ok) {
      return new NextResponse('Upstream error', { status: resp.status });
    }

    const html = await resp.text();
    const processed = postProcessHtml(html, upstreamUrl);
    return new NextResponse(processed, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch {
    return new NextResponse('Failed to load episode', { status: 500 });
  }
}

function postProcessHtml(html: string, upstreamUrl: string) {
  const origin = new URL(upstreamUrl).origin;
  const baseTag = `<base href="${origin}/">`;

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${baseTag}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, `<html$1>\n<head>${baseTag}</head>`);
  } else {
    html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
  }

  html = html
    .replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)')
    .replace(/if\s*\(\s*(?:window\.)?parent\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)')
    .replace(/top\.location\s*=/gi, '// top.location =')
    .replace(/parent\.location\s*=/gi, '// parent.location =');

  return html;
}

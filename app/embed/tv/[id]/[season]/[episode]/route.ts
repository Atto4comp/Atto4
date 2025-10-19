import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { fetchWithBrowser } from '@/lib/browser-proxy';

export const runtime = 'nodejs';
export const maxDuration = 60;

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';

function getRatelimit(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !/^https:\/\//i.test(url)) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'rl-browser',
  });
}

const ratelimit = getRatelimit();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; season: string; episode: string }> }
) {
  const { id, season, episode } = await context.params;

  if (!id || !season || !episode || 
      Number.isNaN(Number(id)) || Number.isNaN(Number(season)) || Number.isNaN(Number(episode))) {
    return new NextResponse('Invalid parameters', { status: 400 });
  }

  // Rate limiting
  if (ratelimit) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.ip || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse('Rate limit exceeded. Please try again later.', { status: 429 });
    }
  }

  try {
    const upstreamUrl = `https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;
    
    console.log(`📺 Proxying TV: ID ${id}, S${season}E${episode}`);

    const result = await fetchWithBrowser({
      url: upstreamUrl,
      timeout: 30000,
      waitForSelector: 'video, iframe, .player',
    });

    if (result.error || !result.html) {
      console.error(`❌ Failed to fetch TV ${id} S${season}E${episode}: ${result.error}`);
      return new NextResponse(
        `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Failed to Load Episode</h2>
            <p>Unable to fetch video content.</p>
          </div>
        </body></html>`,
        { status: 500, headers: { 'Content-Type': 'text/html' } }
      );
    }

    let html = result.html;

    // Inject base tag
    const upstreamOrigin = 'https://iframe.pstream.mov';
    const baseTag = `<base href="${upstreamOrigin}/">`;
    
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${baseTag}`);
    } else {
      html = html.replace(/<html([^>]*)>/i, `<html$1>\n<head>${baseTag}</head>`);
    }

    // Remove frame-busting
    html = html
      .replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)')
      .replace(/top\.location\s*=/gi, '// top.location =')
      .replace(/parent\.location\s*=/gi, '// parent.location =');

    console.log(`✅ Successfully proxied TV S${season}E${episode}`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('❌ TV Proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

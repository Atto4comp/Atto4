import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro';

/** Safe, lazy RL init (no crash if env missing) */
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

function clientIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.ip || 'anonymous';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Rate limit (optional)
  if (ratelimit) {
    const ip = clientIp(request);
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit ?? 0),
          'X-RateLimit-Remaining': String(remaining ?? 0),
          'X-RateLimit-Reset': reset ? String(reset) : '',
          'Cache-Control': 'no-store',
        },
      });
    }
  }

  try {
    // Upstream with backlink
    const upstreamUrl =
      `https://iframe.pstream.mov/embed/tmdb-movie-${encodeURIComponent(id)}` +
      `?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;

    const upstreamOrigin = new URL(upstreamUrl).origin;

    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        // pstream commonly validates these against backlink
        'Referer': `${BACKLINK}/`,
        'Origin': BACKLINK,
      },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(
        `Upstream error: ${upstreamRes.status} ${upstreamRes.statusText}`,
        { status: 502 }
      );
    }

    let html = await upstreamRes.text();

    // Inject <base> for relative assets
    const baseTag = `<base href="${upstreamOrigin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    } else if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
    } else {
      html = `<head>${baseTag}</head>${html}`;
    }

    // Neuter simple frame-busting
    html = html
      .replace(
        /if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi,
        '/* removed */'
      )
      .replace(
        /if\s*\(\s*(?:window\.)?parent\s*!==?\s*(?:window\.)?self\s*\)\s*\{[^}]*\}/gi,
        '/* removed */'
      )
      .replace(/top\.location\s*=/gi, '// top.location =');

    const headers = new Headers({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `frame-ancestors 'self'`,
      'Cache-Control': 'no-store, must-revalidate',
      Pragma: 'no-cache',
    });

    return new NextResponse(html, { status: 200, headers });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Video</h2>
          <p>Unable to connect to video source.</p>
        </div>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

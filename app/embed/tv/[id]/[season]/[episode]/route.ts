import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';

/** Safe RL init */
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

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; season: string; episode: string } }
) {
  const { id, season, episode } = params;

  // Validate parameters (numeric TMDB id/season/episode)
  if (
    !id || !season || !episode ||
    Number.isNaN(Number(id)) || Number.isNaN(Number(season)) || Number.isNaN(Number(episode))
  ) {
    return new NextResponse(
      `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Invalid TV Show Parameters</h2>
          <p>Please provide valid numeric ID, season, and episode.</p>
        </div>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Rate limiting (optional)
  if (ratelimit) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.ip || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  try {
    const upstreamUrl =
      `https://iframe.pstream.mov/embed/tmdb-tv-${encodeURIComponent(id)}` +
      `/${encodeURIComponent(season)}/${encodeURIComponent(episode)}` +
      `?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;

    const upstreamOrigin = new URL(upstreamUrl).origin;

    // Use upstream origin as Referer; don't send Origin header
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `${upstreamOrigin}/`,
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      return new NextResponse(
        `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Episode Not Available</h2>
            <p>Season ${season}, Episode ${episode} (ID: ${id})</p>
            <p style="color:#888">Upstream returned: ${res.status} ${res.statusText}</p>
          </div>
        </body></html>`,
        { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    let html = await res.text();

    // Inject <base> for relative assets
    const baseTag = `<base href="${upstreamOrigin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    } else if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
    } else {
      html = `<!doctype html><html><head>${baseTag}</head><body>${html}</body></html>`;
    }

    // Defang simple frame-busting
    html = html
      .replace(
        /if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi,
        '/* removed */'
      )
      .replace(/top\.location\s*=/gi, '// top.location =')
      .replace(/parent\.location\s*=/gi, '// parent.location =');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': `frame-ancestors 'self'`,
        'Cache-Control': 'no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (err: any) {
    const msg = err?.name === 'AbortError' ? 'Request timed out.' : 'Upstream fetch failed.';
    return new NextResponse(
      `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Episode</h2>
          <p>${msg}</p>
        </div>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}


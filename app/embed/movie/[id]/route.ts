import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const runtime = 'nodejs';

const BACKLINK = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';

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
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Changed to context wrapper
) {
  // ✅ CRITICAL: Await params in Next.js 15
  const { id } = await context.params;

  if (!id || Number.isNaN(Number(id))) {
    return new NextResponse(
      `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Invalid Movie ID</h2>
          <p>Please provide a valid numeric TMDB movie ID.</p>
        </div>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  if (ratelimit) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.ip || 'anon';
    const { success } = await ratelimit.limit(ip);
    if (!success) return new NextResponse('Rate limit exceeded', { status: 429 });
  }

  try {
    // ✅ Build URL exactly as P-Stream expects it
    const upstreamUrl = `https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent(BACKLINK)}`;

    const upstreamOrigin = 'https://iframe.pstream.mov';

    console.log(`🎬 Proxying movie ID: ${id}`);
    console.log(`📍 URL: ${upstreamUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': `${upstreamOrigin}/`,
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    console.log(`📊 Response status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.error(`❌ Upstream returned ${res.status} for movie ${id}`);
      
      return new NextResponse(
        `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Movie Not Available</h2>
            <p>This movie (ID: ${id}) is not available on the streaming service.</p>
            <p style="color:#888;font-size:0.9em">Error: ${res.status} ${res.statusText}</p>
          </div>
        </body></html>`,
        { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }

    let html = await res.text();
    console.log(`📝 Received HTML length: ${html.length} bytes`);

    // Inject base tag
    const baseTag = `<base href="${upstreamOrigin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${baseTag}`);
    } else if (/<html[^>]*>/i.test(html)) {
      html = html.replace(/<html([^>]*)>/i, `<html$1>\n<head>${baseTag}</head>`);
    } else {
      html = `<!doctype html><html><head>${baseTag}</head><body>${html}</body></html>`;
    }

    // Remove frame-busting
    html = html
      .replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi, '/* removed */')
      .replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)')
      .replace(/top\.location\s*=/gi, '// top.location =')
      .replace(/parent\.location\s*=/gi, '// parent.location =');

    console.log(`✅ Successfully proxied movie ${id}`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('❌ Proxy error:', err);
    const msg = err?.name === 'AbortError' ? 'Request timed out.' : 'Upstream fetch failed.';
    
    return new NextResponse(
      `<!doctype html><html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Movie</h2>
          <p>${msg}</p>
          <p style="color:#666;font-size:0.85em">${err?.message || ''}</p>
        </div>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  : null;

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; season: string; episode: string }> }
) {
  // ✅ Await params (Next.js 15 requirement)
  const { id, season, episode } = await params;

  // Validate parameters
  if (!id || !season || !episode || isNaN(Number(id)) || isNaN(Number(season)) || isNaN(Number(episode))) {
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Invalid TV Show Parameters</h2>
          <p>Please provide valid TV show ID, season, and episode numbers</p>
        </div>
      </body></html>`,
      { 
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }

  // Rate limiting
  if (ratelimit) {
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }
  }

  try {
    const upstreamUrl = `https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true`;
    
    console.log(`📺 Proxying TV: ID ${id}, S${season}E${episode}`);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://iframe.pstream.mov/',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.error(`❌ Upstream returned ${response.status} for TV ${id} S${season}E${episode}`);
      
      return new NextResponse(
        `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Episode Not Available</h2>
            <p>Season ${season}, Episode ${episode} is not available for this show.</p>
            <p style="color:#888;font-size:0.9em">Error: ${response.status}</p>
          </div>
        </body></html>`,
        { 
          status: response.status,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    let html = await response.text();

    // Check for "not found" content
    if (html.toLowerCase().includes('not found') || html.toLowerCase().includes('couldn\'t find that page')) {
      console.warn(`⚠️ TV show S${season}E${episode} returned "not found" content`);
      
      return new NextResponse(
        `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Episode Not Found</h2>
            <p>Season ${season}, Episode ${episode} was not found.</p>
          </div>
        </body></html>`,
        { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Inject base tag
    const baseUrl = new URL(upstreamUrl).origin;
    const baseTag = `<base href="${baseUrl}/">`;
    
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n  ${baseTag}`);
    } else {
      html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
    }

    // Remove frame-busting
    html = html.replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)');
    html = html.replace(/if\s*\(\s*(?:window\.)?parent\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)');
    html = html.replace(/top\.location\s*=/gi, '// top.location =');

    console.log(`✅ Successfully proxied TV S${season}E${episode}`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('❌ TV Proxy error:', error);
    
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Episode</h2>
          <p>Unable to connect to streaming service</p>
        </div>
      </body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

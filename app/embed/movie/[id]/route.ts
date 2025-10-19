import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter (optional)
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
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Await params (Next.js 15 requirement)
  const { id } = await params;

  // Validate ID
  if (!id || isNaN(Number(id))) {
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Invalid Movie ID</h2>
          <p>Please provide a valid movie ID</p>
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
    const { success, limit, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse('Rate limit exceeded', { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        }
      });
    }
  }

  try {
    // Build upstream URL
    const upstreamUrl = `https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true`;
    
    console.log(`🎬 Proxying movie ID: ${id} from ${upstreamUrl}`);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://iframe.pstream.mov/',
        'Origin': 'https://iframe.pstream.mov',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    // Check if upstream returned 404 or error
    if (!response.ok) {
      console.error(`❌ Upstream returned ${response.status} for movie ${id}`);
      
      return new NextResponse(
        `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Movie Not Available</h2>
            <p>This movie (ID: ${id}) is not available on the streaming service.</p>
            <p style="color:#888;font-size:0.9em">Error: ${response.status} ${response.statusText}</p>
          </div>
        </body></html>`,
        { 
          status: response.status,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Get HTML content
    let html = await response.text();

    // Check if content contains "not found" or "404" messages
    if (html.toLowerCase().includes('not found') || html.toLowerCase().includes('couldn\'t find that page')) {
      console.warn(`⚠️ Movie ${id} returned "not found" content`);
      
      return new NextResponse(
        `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
          <div style="text-align:center">
            <h2>Movie Not Found</h2>
            <p>The requested movie (ID: ${id}) was not found in the streaming database.</p>
            <p style="color:#888;font-size:0.9em">Please check the movie ID and try again.</p>
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
    } else if (html.includes('<html>')) {
      html = html.replace('<html>', `<html>\n<head>${baseTag}</head>`);
    } else {
      html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
    }

    // Remove frame-busting scripts
    html = html.replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)');
    html = html.replace(/if\s*\(\s*(?:window\.)?parent\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)');
    html = html.replace(/top\.location\s*=/gi, '// top.location =');
    html = html.replace(/parent\.location\s*=/gi, '// parent.location =');

    console.log(`✅ Successfully proxied movie ${id}`);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    
    const isTimeout = error.name === 'AbortError';
    
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Movie</h2>
          <p>${isTimeout ? 'Request timed out. The streaming service is not responding.' : 'Unable to connect to streaming service.'}</p>
          <p style="color:#888;font-size:0.9em">${error.message || 'Unknown error'}</p>
        </div>
      </body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter (optional - see setup section)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
      analytics: true,
    })
  : null;

export const runtime = 'nodejs'; // Important: use Node.js runtime for better stream handling

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Optional: Rate limiting
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
    // Build the upstream embed URL
    const upstreamUrl = `https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true`;
    
    console.log(`🎬 Proxying movie: ${id} from ${upstreamUrl}`);

    // Fetch upstream content
    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': upstreamUrl,
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    // Get the HTML content
    let html = await response.text();

    // Inject base tag to fix relative URLs
    const baseUrl = new URL(upstreamUrl).origin;
    const baseTag = `<base href="${baseUrl}/">`;
    
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${baseTag}`);
    } else if (html.includes('<html>')) {
      html = html.replace('<html>', `<html><head>${baseTag}</head>`);
    }

    // Optional: Remove frame-busting scripts (common patterns)
    html = html.replace(
      /if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi,
      'if(false)'
    );
    html = html.replace(
      /if\s*\(\s*(?:window\.)?parent\s*!==?\s*(?:window\.)?self\s*\)/gi,
      'if(false)'
    );
    html = html.replace(/top\.location\s*=/gi, '// top.location =');

    // Return HTML with cleaned headers
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Explicitly allow embedding in iframes
        'X-Frame-Options': 'ALLOWALL', // Remove restrictive header
        'Content-Security-Policy': "frame-ancestors 'self'", // Allow your domain
        // Prevent caching of proxied content
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      `<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui">
        <div style="text-align:center">
          <h2>Failed to Load Video</h2>
          <p>Unable to connect to video source</p>
        </div>
      </body></html>`,
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

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
  const { id, season, episode } = await params;

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
    
    console.log(`📺 Proxying TV: ${id} S${season}E${episode}`);

    const response = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Upstream returned ${response.status}`);
    }

    let html = await response.text();

    // Inject base tag
    const baseUrl = new URL(upstreamUrl).origin;
    const baseTag = `<base href="${baseUrl}/">`;
    
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${baseTag}`);
    }

    // Remove frame-busting
    html = html.replace(/if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)/gi, 'if(false)');
    html = html.replace(/top\.location\s*=/gi, '// top.location =');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('TV Proxy error:', error);
    return new NextResponse('<html><body>Failed to load video</body></html>', { 
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

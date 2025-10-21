import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { StreamlinkExtractor } from '@/lib/streamlink/extractor';
import { StreamCache } from '@/lib/streamlink/cache';
import { getEnabledProviders, buildProviderUrl } from '@/lib/config/providers';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'rl-extract',
    })
  : null;

export async function POST(request: NextRequest) {
  // Rate limiting
  if (ratelimit) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  try {
    const { mediaType, id, season, episode, quality = 'best' } = await request.json();

    if (!mediaType || !id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check Streamlink availability
    const streamlinkInstalled = await StreamlinkExtractor.isInstalled();
    if (!streamlinkInstalled) {
      return NextResponse.json(
        { error: 'Streamlink is not installed on this server' },
        { status: 503 }
      );
    }

    const providers = getEnabledProviders();
    const attempts: any[] = [];

    // Try each provider in order
    for (const provider of providers) {
      if (!provider.requiresStreamlink) continue;

      // Check cache first
      const cached = await StreamCache.get(mediaType, id, provider.id, season, episode);
      if (cached) {
        return NextResponse.json({
          success: true,
          m3u8Url: cached.m3u8Url,
          quality: cached.quality,
          provider: cached.provider,
          cached: true,
        });
      }

      // Build provider URL
      const providerUrl = buildProviderUrl(provider, mediaType, id, season, episode);

      // Attempt extraction
      const result = await StreamlinkExtractor.extract(
        providerUrl,
        provider.id,
        quality,
        30000
      );

      attempts.push({
        provider: provider.id,
        success: result.success,
        error: result.error,
      });

      if (result.success && result.m3u8Url) {
        // Cache the result
        await StreamCache.set(mediaType, id, provider.id, {
          m3u8Url: result.m3u8Url,
          quality: result.quality || quality,
          provider: provider.id,
          extractedAt: Date.now(),
        }, season, episode);

        return NextResponse.json({
          success: true,
          m3u8Url: result.m3u8Url,
          quality: result.quality,
          availableQualities: result.availableQualities,
          provider: provider.id,
          cached: false,
        });
      }
    }

    // All providers failed
    return NextResponse.json(
      {
        success: false,
        error: 'All providers failed to extract stream',
        attempts,
      },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Extract endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

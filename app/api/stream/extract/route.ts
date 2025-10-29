// app/api/stream/extract/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { StreamlinkExtractor } from '@/lib/streamlink/extractor';
import { StreamCache } from '@/lib/streamlink/cache';
import { getEnabledProviders, buildProviderUrl } from '@/lib/config/providers';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ---- helpers ---------------------------------------------------------------

type MediaType = 'movie' | 'tv';

type ExtractBody = {
  mediaType: MediaType;
  id: string | number;
  season?: string | number | null;
  episode?: string | number | null;
  quality?: string; // e.g. "best", "720p"
};

function jsonResponse(data: any, init?: number | ResponseInit) {
  // Always disable caching for this endpoint
  const baseHeaders = { 'Cache-Control': 'no-store' };
  if (typeof init === 'number') return NextResponse.json(data, { status: init, headers: baseHeaders });
  return NextResponse.json(data, { ...(init || {}), headers: { ...baseHeaders, ...(init as ResponseInit)?.headers } });
}

function getClientIp(req: NextRequest): string {
  // prefer x-forwarded-for first IP, then x-real-ip, then req.ip, else anonymous
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const ip = xff.split(',')[0]?.trim();
    if (ip) return ip;
  }
  const xri = req.headers.get('x-real-ip');
  if (xri) return xri;
  // @ts-expect-error - NextRequest.ip exists on some runtimes
  if ((req as any).ip) return (req as any).ip as string;
  return 'anonymous';
}

function sanitizeAttemptError(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
  return 'Unknown error';
}

// ---- rate limit ------------------------------------------------------------

const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      analytics: true,
      prefix: 'rl-extract',
    })
  : null;

// ---- handler ---------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate limiting
  if (ratelimit) {
    const ip = getClientIp(request);
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429);
    }
  }

  // Parse and validate body (lightweight, avoids adding zod)
  let body: ExtractBody;
  try {
    body = (await request.json()) as ExtractBody;
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const { mediaType, id } = body || ({} as ExtractBody);
  const season = body?.season ?? null;
  const episode = body?.episode ?? null;
  const quality = (body?.quality || 'best').trim();

  if (!mediaType || !id) {
    return jsonResponse({ error: 'Missing required fields: mediaType, id' }, 400);
  }
  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return jsonResponse({ error: 'Invalid mediaType: must be "movie" or "tv"' }, 400);
  }

  // This endpoint is specifically for Streamlink-based providers.
  const providers = getEnabledProviders().filter((p: any) => p?.requiresStreamlink);
  if (!providers.length) {
    return jsonResponse({ error: 'No Streamlink providers are enabled' }, 503);
  }

  // Check Streamlink availability once (avoids per-provider repeats)
  const streamlinkInstalled = await StreamlinkExtractor.isInstalled();
  if (!streamlinkInstalled) {
    return jsonResponse({ error: 'Streamlink is not installed on this server' }, 503);
  }

  const attempts: Array<{ provider: string; success: boolean; error?: string }> = [];

  // Try each provider in order
  for (const provider of providers) {
    try {
      // Cache check
      const cached = await StreamCache.get(mediaType, String(id), provider.id, season, episode);
      if (cached) {
        return jsonResponse({
          success: true,
          m3u8Url: cached.m3u8Url,
          quality: cached.quality || quality,
          provider: cached.provider,
          cached: true,
        });
      }

      // Build provider URL
      const providerUrl = buildProviderUrl(provider, mediaType, String(id), season, episode);

      // Attempt extraction (30s extractor-level timeout; route has maxDuration=60)
      const result = await StreamlinkExtractor.extract(providerUrl, provider.id, quality, 30_000);

      attempts.push({
        provider: provider.id,
        success: !!result?.success,
        error: result?.success ? undefined : sanitizeAttemptError(result?.error),
      });

      if (result?.success && result?.m3u8Url) {
        // Cache the result
        await StreamCache.set(
          mediaType,
          String(id),
          provider.id,
          {
            m3u8Url: result.m3u8Url,
            quality: result.quality || quality,
            provider: provider.id,
            extractedAt: Date.now(),
          },
          season,
          episode
        );

        return jsonResponse({
          success: true,
          m3u8Url: result.m3u8Url,
          quality: result.quality || quality,
          availableQualities: result.availableQualities ?? [],
          provider: provider.id,
          cached: false,
        });
      }
    } catch (err) {
      attempts.push({
        provider: provider?.id ?? 'unknown',
        success: false,
        error: sanitizeAttemptError(err),
      });
      // Continue to next provider
    }
  }

  // All providers failed
  return jsonResponse(
    {
      success: false,
      error: 'All providers failed to extract stream',
      attempts,
    },
    404
  );
}

// Optional: explicit method guard for non-POST (Next will 405 by default in many setups)
// export function GET() {
//   return jsonResponse({ error: 'Method not allowed' }, 405);
// }

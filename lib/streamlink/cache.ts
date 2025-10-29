import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export interface CachedStream {
  m3u8Url: string;
  quality: string;
  provider: string;
  extractedAt: number;
}

export class StreamCache {
  private static TTL = 3600; // seconds (1 hour)

  private static getKey(
    mediaType: 'movie' | 'tv',
    id: string,
    provider: string,
    season?: number,
    episode?: number
  ): string {
    const parts = ['stream', mediaType, id, provider];
    if (mediaType === 'tv') {
      parts.push(`s${season ?? 1}`, `e${episode ?? 1}`);
    }
    return parts.join(':');
  }

  static async get(
    mediaType: 'movie' | 'tv',
    id: string,
    provider: string,
    season?: number,
    episode?: number
  ): Promise<CachedStream | null> {
    if (!redis) return null;
    try {
      const key = this.getKey(mediaType, id, provider, season, episode);
      const cached = await redis.get<CachedStream>(key);
      if (cached && Date.now() - cached.extractedAt < this.TTL * 1000) {
        console.log(`💾 Cache hit: ${key}`);
        return cached;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(
    mediaType: 'movie' | 'tv',
    id: string,
    provider: string,
    stream: CachedStream,
    season?: number,
    episode?: number
  ): Promise<void> {
    if (!redis) return;
    try {
      const key = this.getKey(mediaType, id, provider, season, episode);
      // Upstash Redis SDK supports EX via options on set()
      await redis.set(key, stream, { ex: this.TTL });
      console.log(`💾 Cached: ${key}`);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async clear(
    mediaType: 'movie' | 'tv',
    id: string,
    _season?: number,
    _episode?: number
  ): Promise<void> {
    if (!redis) return;
    try {
      const pattern = `stream:${mediaType}:${id}:*`;
      // Implement SCAN/DEL if you need active invalidation
      console.log(`🗑️ Would clear cache matching: ${pattern}`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

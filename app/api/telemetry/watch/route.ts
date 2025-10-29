// app/api/telemetry/watch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data: any, init?: number | ResponseInit) {
  const baseHeaders = { 'Cache-Control': 'no-store' };
  if (typeof init === 'number') return NextResponse.json(data, { status: init, headers: baseHeaders });
  return NextResponse.json(data, { ...(init || {}), headers: { ...baseHeaders, ...(init as ResponseInit)?.headers } });
}

const VALID_EVENTS = new Set(['play', 'pause', 'end', 'seek', 'buffer']);

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const {
      userId = 'anonymous',
      titleId,
      mediaType = 'movie',
      season = null,
      episode = null,
      eventType,
      position,
      duration,
      metadata = {},
    } = body ?? {};

    // Basic validation
    if (!titleId || typeof titleId !== 'string') {
      return json({ error: 'Missing or invalid titleId' }, 400);
    }
    if (!eventType || typeof eventType !== 'string' || !VALID_EVENTS.has(eventType)) {
      return json({ error: 'Missing or invalid eventType' }, 400);
    }

    const pos = Number(position);
    const dur = Number(duration);
    if (!Number.isFinite(pos) || !Number.isFinite(dur) || dur < 0 || pos < 0) {
      return json({ error: 'Missing or invalid position/duration' }, 400);
    }

    const mt = mediaType === 'tv' ? 'tv' : 'movie'; // normalize to "movie" | "tv"

    // Record telemetry event
    await query(
      `INSERT INTO watch_telemetry
         (user_id, title_id, media_type, season, episode, event_type, position, duration, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [String(userId), String(titleId), mt, season, episode, eventType, pos, dur, JSON.stringify(metadata ?? {})]
    );

    // Update watch progress for key events
    if (eventType === 'play' || eventType === 'pause' || eventType === 'end') {
      const ratio = dur > 0 ? pos / dur : 0;
      const completed = eventType === 'end' || ratio > 0.9;

      await query(
        `INSERT INTO watch_progress
           (user_id, title_id, media_type, season, episode, position, duration, percentage, completed, last_watched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, ROUND(CASE WHEN $7 > 0 THEN ($6::decimal / NULLIF($7,0)) * 100 ELSE 0 END, 2), $8, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, title_id, season, episode)
         DO UPDATE SET
           position = EXCLUDED.position,
           duration = EXCLUDED.duration,
           percentage = EXCLUDED.percentage,
           completed = EXCLUDED.completed,
           last_watched_at = CURRENT_TIMESTAMP`,
        [String(userId), String(titleId), mt, season, episode, pos, dur, completed]
      );
      // NOTE: If you want separate progress rows per mediaType, make the conflict target include media_type.
    }

    return json({ success: true });
  } catch (err) {
    console.error('Telemetry error:', err);
    const message = err instanceof Error ? err.message : 'Failed to record telemetry';
    return json({ error: message }, 500);
  }
}

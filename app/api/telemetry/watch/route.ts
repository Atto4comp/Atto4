import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = 'anonymous',
      titleId,
      mediaType = 'movie',
      season,
      episode,
      eventType,
      position,
      duration,
      metadata = {},
    } = body;

    if (!titleId || !eventType || position === undefined || duration === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Record telemetry event
    await query(
      `INSERT INTO watch_telemetry 
       (user_id, title_id, media_type, season, episode, event_type, position, duration, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, titleId, mediaType, season, episode, eventType, position, duration, JSON.stringify(metadata)]
    );

    // Update watch progress
    if (eventType === 'play' || eventType === 'pause' || eventType === 'end') {
      const completed = eventType === 'end' || (duration > 0 && position / duration > 0.9);

      await query(
        `INSERT INTO watch_progress 
         (user_id, title_id, media_type, season, episode, position, duration, completed, last_watched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, title_id, season, episode)
         DO UPDATE SET
           position = EXCLUDED.position,
           duration = EXCLUDED.duration,
           completed = EXCLUDED.completed,
           last_watched_at = CURRENT_TIMESTAMP`,
        [userId, titleId, mediaType, season, episode, position, duration, completed]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Telemetry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record telemetry' },
      { status: 500 }
    );
  }
}

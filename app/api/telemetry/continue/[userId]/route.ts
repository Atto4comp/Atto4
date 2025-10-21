import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const result = await query(
      `SELECT * FROM watch_progress 
       WHERE user_id = $1 AND completed = FALSE AND percentage > 5 AND percentage < 90
       ORDER BY last_watched_at DESC 
       LIMIT 20`,
      [userId]
    );

    const continueWatching = result.rows.map(row => ({
      titleId: row.title_id,
      mediaType: row.media_type,
      season: row.season,
      episode: row.episode,
      position: row.position,
      duration: row.duration,
      percentage: row.percentage,
      lastWatchedAt: row.last_watched_at,
    }));

    return NextResponse.json({ continueWatching });
  } catch (error: any) {
    console.error('Continue watching error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch continue watching' },
      { status: 500 }
    );
  }
}

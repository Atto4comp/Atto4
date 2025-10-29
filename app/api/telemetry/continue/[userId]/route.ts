// app/api/telemetry/continue/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data: any, init?: number | ResponseInit) {
  const baseHeaders = { 'Cache-Control': 'no-store' };
  if (typeof init === 'number') return NextResponse.json(data, { status: init, headers: baseHeaders });
  return NextResponse.json(data, { ...(init || {}), headers: { ...baseHeaders, ...(init as ResponseInit)?.headers } });
}

type Params = { userId: string };

export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    const { userId } = context.params || ({} as Params);
    if (!userId || typeof userId !== 'string') {
      return json({ error: 'Invalid or missing userId' }, 400);
    }

    // Optional: accept ?limit=... (capped)
    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get('limit');
    const limit = Math.min(Math.max(Number(rawLimit ?? 20) || 20, 1), 50);

    const result = await query(
      `SELECT * FROM watch_progress
       WHERE user_id = $1
         AND completed = FALSE
         AND percentage > 5 AND percentage < 90
       ORDER BY last_watched_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    const continueWatching = result.rows.map((row: any) => ({
      titleId: row.title_id,
      mediaType: row.media_type,
      season: row.season,
      episode: row.episode,
      position: Number(row.position) ?? 0,
      duration: Number(row.duration) ?? 0,
      percentage: Number(row.percentage) ?? 0,
      lastWatchedAt: row.last_watched_at,
    }));

    return json({ continueWatching });
  } catch (err) {
    console.error('Continue watching error:', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch continue watching';
    return json({ error: message }, 500);
  }
}

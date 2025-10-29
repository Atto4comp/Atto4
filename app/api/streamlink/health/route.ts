// app/api/streamlink/health/route.ts
import { NextResponse } from 'next/server';
import { M3U8Processor } from '@/lib/m3u8/processor';

export const runtime = 'nodejs';
// Ensure this endpoint is never statically cached by Next.js
export const dynamic = 'force-dynamic';

function json(data: any, init?: number | ResponseInit) {
  const baseHeaders = { 'Cache-Control': 'no-store' };
  if (typeof init === 'number') {
    return NextResponse.json(data, { status: init, headers: baseHeaders });
  }
  return NextResponse.json(data, {
    ...(init || {}),
    headers: { ...baseHeaders, ...(init as ResponseInit)?.headers },
  });
}

export async function GET() {
  try {
    const installed = await M3U8Processor.isStreamlinkInstalled();

    if (!installed) {
      return json(
        {
          status: 'error',
          message: 'Streamlink is not installed',
          installed: false,
          ready: false,
        },
        503
      );
    }

    return json({
      status: 'ok',
      message: 'Streamlink is available',
      installed: true,
      ready: true,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Internal server error';
    return json(
      {
        status: 'error',
        message,
        installed: false,
        ready: false,
      },
      500
    );
  }
}

// Optional: respond to HEAD for lightweight health checks
export async function HEAD() {
  const res = await GET();
  // Strip body for HEAD responses
  return new NextResponse(null, { status: res.status, headers: res.headers });
}


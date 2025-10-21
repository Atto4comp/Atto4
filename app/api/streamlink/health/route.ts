import { NextResponse } from 'next/server';
import { M3U8Processor } from '@/lib/m3u8/processor';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const installed = await M3U8Processor.isStreamlinkInstalled();

    if (!installed) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Streamlink is not installed',
          installed: false,
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Streamlink is available',
      installed: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message,
        installed: false,
      },
      { status: 500 }
    );
  }
}

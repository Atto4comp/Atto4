// app/api/recommendations/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: Make it faster on Edge

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) return NextResponse.json({ results: [] });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`,
      { next: { revalidate: 86400 } } // Cache this fetch for 24 hours
    );
    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}

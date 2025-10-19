export const runtime = 'edge';

function upstreamTvUrl(id: string, season: string, episode: string) {
  return `https://iframe.pstream.mov/embed/tmdb-tv-${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/`;
}

export async function GET(_req: Request, { params }: { params: { id: string; season: string; episode: string } }) {
  const upstream = upstreamTvUrl(params.id, params.season, params.episode);

  const upstreamRes = await fetch(upstream, {
    headers: {
      'Referer': 'https://iframe.pstream.mov',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const headers = new Headers(upstreamRes.headers);
  headers.delete('x-frame-options');
  if (headers.has('content-security-policy')) {
    const csp = headers.get('content-security-policy')!;
    const cleaned = csp.replace(/frame-ancestors[^;]*;?/gi, '');
    if (cleaned.trim()) headers.set('content-security-policy', cleaned);
    else headers.delete('content-security-policy');
  }
  if (!headers.get('content-type')) headers.set('content-type', 'text/html; charset=utf-8');

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  });
}

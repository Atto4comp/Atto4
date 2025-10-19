// Runs at Edge (fast). Switch to 'nodejs' if you need node-only libs.
export const runtime = 'edge';

function upstreamMovieUrl(id: string) {
  // Keep your original query string here
  return `https://iframe.pstream.mov/embed/tmdb-movie-${encodeURIComponent(id)}?logo=false&tips=false&theme=default&allinone=true&&backlink=https://atto4.pro/`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const upstream = upstreamMovieUrl(params.id);

  // Send Referer and UA if needed by upstream
  const upstreamRes = await fetch(upstream, {
    headers: {
      'Referer': 'https://iframe.pstream.mov',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  // Clone headers so we can edit
  const headers = new Headers(upstreamRes.headers);

  // Remove/relax frame-blocking headers
  headers.delete('x-frame-options'); // DENY/SAMEORIGIN
  if (headers.has('content-security-policy')) {
    const csp = headers.get('content-security-policy')!;
    // strip any frame-ancestors directive
    const cleaned = csp.replace(/frame-ancestors[^;]*;?/gi, '');
    if (cleaned.trim()) headers.set('content-security-policy', cleaned);
    else headers.delete('content-security-policy');
  }

  // Make sure content-type is text/html
  if (!headers.get('content-type')) headers.set('content-type', 'text/html; charset=utf-8');

  // Stream body through
  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  });
}

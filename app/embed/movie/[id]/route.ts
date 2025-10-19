export const runtime = 'nodejs'; // full header control + HTML rewrite

function upstreamMovieUrl(id: string) {
  return `https://iframe.pstream.mov/embed/tmdb-movie-${encodeURIComponent(id)}?logo=false&tips=false&theme=default&allinone=true&&backlink=https://atto4.pro/`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const upstream = upstreamMovieUrl(params.id);

  const upstreamRes = await fetch(upstream, {
    // Some platforms block setting UA; nodejs runtime allows it.
    headers: {
      'Referer': 'https://iframe.pstream.mov',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      // Add more headers if needed by the provider:
      // 'Origin': 'https://iframe.pstream.mov',
      // 'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const status = upstreamRes.status;
  const text = await upstreamRes.text();

  // Inject <base> so relative URLs resolve to upstream
  // Remove common frame-busters (best-effort)
  let html = text;

  // add <base> right after <head> (or inject a head if missing)
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="https://iframe.pstream.mov/">`
    );
  } else {
    html = `<head><base href="https://iframe.pstream.mov/"></head>${html}`;
  }

  // Neuter common frame-busting patterns
  html = html
    .replace(/if\s*\(\s*top\s*!==\s*self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi, '/* removed */')
    .replace(/window\.top\s*!=\s*window\.self\s*&&\s*\(.*?\);?/gi, '/* removed */');

  // Build safe headers
  const headers = new Headers(upstreamRes.headers);

  // Strip frame blockers
  headers.delete('x-frame-options');
  if (headers.has('content-security-policy')) {
    const csp = headers.get('content-security-policy')!;
    const cleaned = csp.replace(/frame-ancestors[^;]*;?/gi, '');
    if (cleaned.trim()) headers.set('content-security-policy', cleaned);
    else headers.delete('content-security-policy');
  }

  // Ensure proper content type
  headers.set('content-type', 'text/html; charset=utf-8');

  // Avoid caching (optional during dev)
  headers.set('cache-control', 'no-store');

  return new Response(html, { status, headers });
}

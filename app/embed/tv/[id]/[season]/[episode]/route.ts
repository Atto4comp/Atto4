export const runtime = 'nodejs';

function upstreamTvUrl(id: string, season: string, episode: string) {
  return `https://iframe.pstream.mov/embed/tmdb-tv-${encodeURIComponent(id)}/${encodeURIComponent(season)}/${encodeURIComponent(episode)}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/`;
}

export async function GET(_req: Request, { params }: { params: { id: string; season: string; episode: string } }) {
  const upstream = upstreamTvUrl(params.id, params.season, params.episode);

  const upstreamRes = await fetch(upstream, {
    headers: {
      'Referer': 'https://iframe.pstream.mov',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
    },
  });

  const status = upstreamRes.status;
  const text = await upstreamRes.text();

  let html = text;

  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(
      /<head([^>]*)>/i,
      `<head$1><base href="https://iframe.pstream.mov/">`
    );
  } else {
    html = `<head><base href="https://iframe.pstream.mov/"></head>${html}`;
  }

  html = html
    .replace(/if\s*\(\s*top\s*!==\s*self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi, '/* removed */')
    .replace(/window\.top\s*!=\s*window\.self\s*&&\s*\(.*?\);?/gi, '/* removed */');

  const headers = new Headers(upstreamRes.headers);
  headers.delete('x-frame-options');
  if (headers.has('content-security-policy')) {
    const csp = headers.get('content-security-policy')!;
    const cleaned = csp.replace(/frame-ancestors[^;]*;?/gi, '');
    if (cleaned.trim()) headers.set('content-security-policy', cleaned);
    else headers.delete('content-security-policy');
  }
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');

  return new Response(html, { status, headers });
}

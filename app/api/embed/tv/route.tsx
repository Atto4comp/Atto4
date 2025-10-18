import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Builds the upstream 3P TV URL server-side and returns a tiny HTML wrapper under your domain
export async function GET(req: NextRequest) {
  const mid = req.nextUrl.searchParams.get('mid');
  const s = req.nextUrl.searchParams.get('s');
  const e = req.nextUrl.searchParams.get('e');
  if (!mid || !s || !e) return new Response('Missing params', { status: 400 });

  const providerTpl = process.env.NEXT_PUBLIC_TV_EMBED_1 ||
    'https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/';
  const upstreamUrl = providerTpl
    .replace(/\$\{id\}/g, String(mid))
    .replace(/\$\{season\}/g, String(s))
    .replace(/\$\{episode\}/g, String(e));

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TV Player</title>
  <style>html,body,#wrap{height:100%;margin:0;background:#000} iframe{border:0;width:100%;height:100%}</style>
  <meta http-equiv="Referrer-Policy" content="no-referrer">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
</head>
<body>
  <div id="wrap">
    <iframe
      src="${upstreamUrl}"
      referrerpolicy="no-referrer"
      allow="autoplay; encrypted-media; picture-in-picture"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-orientation-lock allow-presentation allow-popups"
    ></iframe>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, private',
      'Content-Security-Policy': "default-src 'self'; frame-src *; connect-src 'self'; img-src 'self' data:; media-src *; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    },
  });
}

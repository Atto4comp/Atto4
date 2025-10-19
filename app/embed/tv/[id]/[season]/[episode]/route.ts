import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; season: string; episode: string } }
) {
  const { id, season, episode } = params;

  const upstreamUrl =
    `https://iframe.pstream.mov/embed/tmdb-tv-${encodeURIComponent(id)}` +
    `/${encodeURIComponent(season)}/${encodeURIComponent(episode)}` +
    `?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent('https://atto4.pro/')}`;

  const upstreamOrigin = new URL(upstreamUrl).origin;

  const res = await fetch(upstreamUrl, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': `${upstreamOrigin}/`,
    },
  });

  if (!res.ok) {
    return new NextResponse(`Upstream error: ${res.status} ${res.statusText}`, { status: 502 });
  }

  let html = await res.text();

  const baseTag = `<base href="${upstreamOrigin}/">`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  } else {
    html = `<head>${baseTag}</head>${html}`;
  }

  html = html
    .replace(
      /if\s*\(\s*(?:window\.)?top\s*!==?\s*(?:window\.)?self\s*\)\s*top\.location\s*=\s*self\.location\s*;?/gi,
      '/* removed */'
    )
    .replace(/top\.location\s*=/gi, '// top.location =');

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `frame-ancestors 'self'`,
      'Cache-Control': 'no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // exact upstream pattern; SINGLE '&' before backlink
  const upstreamUrl =
    `https://iframe.pstream.mov/embed/tmdb-movie-${encodeURIComponent(id)}` +
    `?logo=false&tips=false&theme=default&allinone=true&backlink=${encodeURIComponent('https://atto4.pro/')}`;

  const upstreamOrigin = new URL(upstreamUrl).origin;

  // minimal headers: present like a browser, referer = upstream origin
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

  // inject <base> so relative paths resolve
  const baseTag = `<base href="${upstreamOrigin}/">`;
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
  } else if (/<html[^>]*>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, `<html$1><head>${baseTag}</head>`);
  } else {
    html = `<head>${baseTag}</head>${html}`;
  }

  // defang simple frame-busters (best-effort)
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

// app/player/[mediatype]/[id]/page.tsx
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

type Params = { mediatype: 'movie' | 'tv'; id: string };
export default function PlayerWrapper({ params }: { params: Params }) {
  const search = useSearchParams();
  const s = search.get('s') ?? search.get('season') ?? '1';
  const e = search.get('e') ?? search.get('episode') ?? '1';

  const src = useMemo(() => {
    if (params.mediatype === 'movie') {
      return `/embed/movie/${encodeURIComponent(params.id)}`;
    }
    return `/embed/tv/${encodeURIComponent(params.id)}/${encodeURIComponent(s)}/${encodeURIComponent(e)}`;
  }, [params.mediatype, params.id, s, e]);

  return (
    <div className="fixed inset-0 bg-black">
      <iframe
        src={src}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{ border: 'none' }}
      />

      {/* Top-right brand tag */}
      <div className="absolute top-3 right-4 z-40">
        <div className="px-3 py-1 rounded-full bg-white/8 backdrop-blur text-white/90 border border-white/10">
          <span className="font-chillax tracking-wide text-sm">Atto4</span>
        </div>
      </div>
    </div>
  );
}

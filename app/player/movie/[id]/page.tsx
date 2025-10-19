'use client';

export default function MovieWrapper({ params }: { params: { id: string } }) {
  const src = `/embed/movie/${encodeURIComponent(params.id)}`;

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

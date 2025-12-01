// components/ads/BannerAd.tsx
'use client';

// Define your ad URLs here (direct iframe links)
const AD_SOURCES = [
  'https://embarrassed-bridge.com/b.3TVm0/Pm3QpNv/b/myVgJEZaDF0o2LN/zeEf3xN/TBUm4/LrT/YY3/MBTRcT1SNBTOkr',
  // Add more ad iframe URLs as needed
];

export default function BannerAd() {
  // Randomly select an ad on each page load (or just use [0] for fixed)
  const adUrl = AD_SOURCES[Math.floor(Math.random() * AD_SOURCES.length)];

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4">
      {/* Label */}
      <div className="text-[10px] uppercase tracking-widest text-gray-500/50 mb-2 font-medium">
        Sponsored
      </div>

      {/* Single Rectangular Frame */}
      <div className="relative w-full max-w-[728px] h-[90px] bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-2xl transition-all hover:border-white/20 hover:bg-white/10">
        
        {/* Ad Iframe */}
        <iframe
          src={adUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
        />

      </div>
    </div>
  );
}

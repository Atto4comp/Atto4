'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      
      {/* Loading Orb */}
      <div className="relative w-16 h-16">
        {/* 1. Frosted Glass Background Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-white/10 backdrop-blur-sm" />
        
        {/* 2. Glowing Gradient Arc (The Actual Spinner) */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-transparent border-l-transparent animate-spin" />
        
        {/* 3. Inner Pulse (Heartbeat) */}
        <div className="absolute inset-4 rounded-full bg-white/5 animate-pulse" />
      </div>

      {/* Text */}
      <div className="mt-6 text-sm font-medium text-white/50 font-chillax tracking-widest uppercase animate-pulse">
        Loading
      </div>
    </div>
  );
}


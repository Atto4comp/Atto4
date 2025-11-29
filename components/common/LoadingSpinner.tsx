export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      
      {/* Progress Container */}
      <div className="relative w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        
        {/* Moving Gradient Bar */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />
        
        {/* Glow Effect */}
        <div className="absolute inset-0 w-full h-full bg-blue-500/50 blur-[4px] animate-pulse" />
      </div>

      {/* Text Animation */}
      <div className="mt-4 text-sm font-medium text-white/60 font-chillax tracking-widest uppercase animate-pulse">
        Processing
      </div>

      {/* Inline Styles for Custom Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}

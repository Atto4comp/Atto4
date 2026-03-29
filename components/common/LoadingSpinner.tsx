'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="relative h-10 w-10">
        {/* Single arc spinner */}
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
        <div className="absolute inset-0 animate-spin-arc rounded-full border-2 border-transparent border-t-[var(--accent)]" style={{ animationDuration: '0.8s' }} />
      </div>
    </div>
  );
}

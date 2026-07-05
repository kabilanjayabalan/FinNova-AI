import React, { useEffect, useState } from 'react';

const PageLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 1500;
    const animate = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(animate);
      else setTimeout(() => onComplete?.(), 200);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#0F172A' }}
    >
      {/* Candlestick SVG logo */}
      <div className="flex items-center gap-3 mb-8">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="8" width="4" height="16" rx="1" fill="#3B82F6" />
          <rect x="3" y="12" width="6" height="2" rx="0.5" fill="#3B82F6" />
          <rect x="14" y="4" width="4" height="20" rx="1" fill="#10B981" />
          <rect x="13" y="8" width="6" height="2" rx="0.5" fill="#10B981" />
          <rect x="24" y="10" width="4" height="14" rx="1" fill="#F59E0B" />
          <rect x="23" y="14" width="6" height="2" rx="0.5" fill="#F59E0B" />
        </svg>
        <div>
          <span className="text-2xl font-bold text-white">Fin</span>
          <span className="text-2xl font-bold" style={{ color: '#3B82F6' }}>Nova</span>
          <span className="text-2xl font-semibold text-slate-400 ml-1">AI</span>
        </div>
      </div>

      {/* Animated candlestick bars */}
      <div className="flex items-end gap-3 h-16 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-3 rounded-sm"
            style={{
              backgroundColor: i % 2 === 0 ? '#10B981' : '#EF4444',
              animation: `candleGrow 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
              height: `${20 + i * 10}px`,
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
          }}
        />
      </div>

      <p className="text-slate-400 text-sm">Loading your financial dashboard...</p>

      <style>{`
        @keyframes candleGrow {
          from { transform: scaleY(0.5); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;

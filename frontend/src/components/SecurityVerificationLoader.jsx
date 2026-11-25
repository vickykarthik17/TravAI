import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const SecurityVerificationLoader = ({ onComplete, duration = 2200, isInitialBoot = true }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const verificationStages = [
    { text: 'VERIFYING SECURITY CREDENTIALS...', detail: 'Establishing 256-bit encrypted TLS session...' },
    { text: 'VALIDATING OPERATOR DUTY CLEARANCE...', detail: 'Cross-referencing resort role authorization & PMS tenant...' },
    { text: 'SYNCHRONIZING RESORT LEDGER...', detail: 'Connecting to real-time room inventory & yield engine...' },
    { text: 'SECURITY CREDENTIALS VERIFIED', detail: 'Session established. Welcome to Nexgile-TravAI Portal.' },
  ];

  useEffect(() => {
    // Step transitions
    const stepDuration = duration / 3.5;
    const t1 = setTimeout(() => setStepIndex(1), stepDuration);
    const t2 = setTimeout(() => setStepIndex(2), stepDuration * 2);
    const t3 = setTimeout(() => setStepIndex(3), stepDuration * 3);

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, duration);

    const finishTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration + 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none transition-opacity duration-500 bg-[#050711] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#050711',
        background: 'radial-gradient(circle 700px at 50% 50%, rgba(245, 158, 11, 0.08), transparent 70%), radial-gradient(circle 900px at 50% 15%, rgba(6, 182, 212, 0.07), transparent 70%), linear-gradient(180deg, #050711 0%, #080C1A 45%, #050713 100%)',
      }}
    >
      {/* Ambient background grid / dust glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center text-center px-6 max-w-lg space-y-7 z-10">
        {/* Luxury Golden Circular Spinner Ring (Dark Suitability) */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer faint gold/slate track ring */}
          <div className="w-16 h-16 rounded-full border-2 border-amber-500/15" />
          
          {/* Rotating sunlit gold segment with neon aura */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.45)] animate-spin"
            style={{ animationDuration: '1.05s' }}
          />

          {/* Center glowing golden gem */}
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse" />
        </div>

        {/* Golden Typography - Sunlit Gold over Obsidian Midnight */}
        <div className="space-y-2.5">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.28em] uppercase transition-all duration-300 font-serif text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.45)]">
            {verificationStages[stepIndex].text}
          </h2>

          <p className="text-[11px] tracking-widest transition-all duration-300 font-sans text-slate-400">
            {verificationStages[stepIndex].detail}
          </p>
        </div>

        {/* Micro-Progress Bar with Sunlit Gold-to-Emerald Gradient */}
        <div className="w-56 h-1.5 rounded-full overflow-hidden bg-slate-900/90 border border-slate-800/90 shadow-inner mt-2 p-0.5">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((stepIndex + 1) / verificationStages.length) * 100}%`,
              background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #10b981 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
            }}
          />
        </div>

        {/* 5-Star Resort Security Badge */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/25 shadow-xl backdrop-blur-md text-[10px] tracking-widest uppercase font-serif text-amber-200/90 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Nexgile-TravAI · 5-Star Resort Security Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

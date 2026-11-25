import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Zap,
  Activity,
  Sliders,
  Play,
  Pause,
  Key,
  ShieldCheck,
  Bot,
  Percent,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const SLIDES = [
  {
    id: 'YIELD',
    tag: 'DYNAMIC YIELD ALGORITHM',
    title: 'Autonomous Price Surge & Parity Maximizer',
    description: 'Machine learning rates adapt in milliseconds to local booking velocity, city festivals, and competitor price undercuts.',
    icon: TrendingUp,
    accentColor: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    actionLabel: 'Launch Yield Manager',
    targetTab: 'REVENUE_MANAGER',
  },
  {
    id: 'PMS',
    tag: 'INTELLIGENT PMS RACK',
    title: 'Predictive Room Turnaround & Digital Keys',
    description: 'Auto-dispatch housekeeping stewards based on live arrivals, mobile digital key issuance, and VIP preferences.',
    icon: Building2,
    accentColor: 'from-blue-500 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    actionLabel: 'Open Front Desk PMS',
    targetTab: 'FRONT_DESK',
  },
  {
    id: 'CHANNELS',
    tag: 'MULTI-MODAL DISTRIBUTION',
    title: 'Zero-Latency Parity Across 20,000+ Channels',
    description: 'Continuous two-way synchronization across Amadeus GDS, Expedia, Booking.com, and Google Hotel Ads with instant stop-sell guardrails.',
    icon: Globe,
    accentColor: 'from-emerald-400 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    actionLabel: 'View Global Feeds',
    targetTab: 'CHANNELS',
  },
  {
    id: 'CONCIERGE',
    tag: 'ENTERPRISE AI COPILOT',
    title: 'Natural Language Guest Requests & Chef Orders',
    description: 'In-stay IoT room controls, culinary dining dispatch, and personalized luxury itineraries processed autonomously by LLMs.',
    icon: Sparkles,
    accentColor: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    actionLabel: 'Chat with Copilot',
    targetTab: 'AI_CONCIERGE',
  },
];

export const LinearShowcaseSlider = ({ onNavigate, currency = 'USD' }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Interactive Widget 1: Demand Scrubber State
  const [simulatedDemand, setSimulatedDemand] = useState(78); // 30% to 100%

  // Interactive Widget 2: Turnaround Team Toggle
  const [selectedTeam, setSelectedTeam] = useState('Alpha');
  const [turnaroundStatus, setTurnaroundStatus] = useState('Active Dispatch (32 mins)');

  // Interactive Widget 3: Instant Sync Latency Simulation
  const [syncStatus, setSyncStatus] = useState('Synchronized');
  const [syncPing, setSyncPing] = useState(24);
  const [isSyncing, setIsSyncing] = useState(false);

  // Interactive Widget 4: Concierge Prompt Simulator
  const [conciergePrompt, setConciergePrompt] = useState('Extra towels & organic tea for Room 102');
  const [conciergeReply, setConciergeReply] = useState('Floor steward dispatched to Suite 102 with hypoallergenic towels & herbal tea selection.');

  const SLIDE_DURATION = 5500; // 5.5 seconds per slide
  const TICK_INTERVAL = 50;

  // Auto-slide Timer with Smooth Progress Fill
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / SLIDE_DURATION) * 100;
        if (next >= 100) {
          setActiveIdx((current) => (current + 1) % SLIDES.length);
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, activeIdx]);

  const handleSelectSlide = (idx) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setProgress(0);
  };

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncStatus('Executing live 2-way parity handshake...');
    setTimeout(() => {
      setSyncStatus('Synchronized (100% Parity Clean)');
      setSyncPing(Math.floor(18 + Math.random() * 12));
      setIsSyncing(false);
    }, 700);
  };

  const handlePromptSelect = (prompt, reply) => {
    setConciergePrompt(prompt);
    setConciergeReply(reply);
  };

  const currentSlide = SLIDES[activeIdx];

  // Dynamic calculations for Slide 1 based on slider
  const simulatedBaseRate = 260;
  const simulatedSuggestedRate = Math.round(simulatedBaseRate * (1 + (simulatedDemand - 50) / 100));
  const simulatedRevpar = Math.round(simulatedSuggestedRate * (simulatedDemand / 100));

  return (
    <div
      className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ background: currentSlide.glowColor }}
      />

      {/* Top Header & Slider Tabs (Linear Style with Filling Progress Bar) */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
              Interactive Operational Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3 h-3 text-cyan-400" /> : <Pause className="w-3 h-3 text-slate-400" />}
              <span>{isPaused ? 'Resume Auto-Slide' : 'Pause'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Interactive Progress Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {SLIDES.map((slide, idx) => {
            const isActive = activeIdx === idx;
            const Icon = slide.icon;

            return (
              <button
                key={slide.id}
                onClick={() => handleSelectSlide(idx)}
                className={`relative p-3 rounded-2xl text-left border transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-slate-950 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`p-1 rounded-lg border ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {slide.tag.split(' ')[0]} {slide.tag.split(' ')[1]}
                  </span>
                </div>

                {/* Linear-Style Animated Progress Line */}
                <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-75 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#38bdf8]'
                        : idx < activeIdx
                        ? 'bg-cyan-900/60 w-full'
                        : 'w-0'
                    }`}
                    style={{ width: isActive ? `${progress}%` : idx < activeIdx ? '100%' : '0%' }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slide Content Body: 2-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        
        {/* Left Column: Description & Primary Navigation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-cyan-300 border border-cyan-800/50 text-[11px] font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentSlide.tag}</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight leading-snug">
            {currentSlide.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            {currentSlide.description}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate && onNavigate(currentSlide.targetTab)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{currentSlide.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400">Interactive live widget on right &rarr;</span>
          </div>
        </div>

        {/* Right Column: High-End Interactive Mini Widget */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          
          {/* SLIDE 1: INTERACTIVE YIELD & DEMAND SIMULATOR */}
          {activeIdx === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Demand Surge Scrubber</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  98% ML Confidence
                </span>
              </div>

              {/* Interactive Range Slider */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-semibold">Simulate Regional Demand Surge:</span>
                  <strong className="text-cyan-400 font-mono text-sm">{simulatedDemand}%</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="98"
                  value={simulatedDemand}
                  onChange={(e) => setSimulatedDemand(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>30% (Low Pace)</span>
                  <span>65% (Seasonal)</span>
                  <span>98% (High Demand Lift)</span>
                </div>
              </div>

              {/* Dynamic Live Calculated Metric Tiles */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Suggested Dynamic Rate</p>
                  <p className="text-xl font-black text-cyan-400 font-display mt-0.5">
                    {formatCurrency(simulatedSuggestedRate, currency)}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    +{Math.round(((simulatedSuggestedRate - simulatedBaseRate) / simulatedBaseRate) * 100)}% Surge Lift
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Projected RevPAR (Yield)</p>
                  <p className="text-xl font-black text-emerald-400 font-display mt-0.5">
                    {formatCurrency(simulatedRevpar, currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated Parity Parity Safe</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: INTERACTIVE PMS ROOM TURNAROUND SCRUBBER */}
          {activeIdx === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Fast Turnaround Matrix</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold">{turnaroundStatus}</span>
              </div>

              {/* Interactive Floor Team Switcher */}
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 font-semibold">Assign Active Housekeeping Team:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Alpha', 'Bravo', 'VIP Steward'].map((team) => (
                    <button
                      key={team}
                      onClick={() => {
                        setSelectedTeam(team);
                        setTurnaroundStatus(
                          team === 'VIP Steward'
                            ? 'Rush Priority: Suite 101 Expedited'
                            : `Assigned to Team ${team} (28 mins pace)`
                        );
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedTeam === team
                          ? 'bg-blue-600/30 border-blue-400 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Room Status Indicator Cards */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Room 101</p>
                  <p className="font-bold text-emerald-400 mt-0.5">Clean &bull; Key Issued</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Room 202</p>
                  <p className="font-bold text-amber-400 mt-0.5">Turnaround {selectedTeam}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Room 301</p>
                  <p className="font-bold text-cyan-400 mt-0.5">VIP Ready</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: INTERACTIVE 20,000+ CHANNEL PARITY SYNC */}
          {activeIdx === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Two-Way Parity Telemetry</span>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{syncPing}ms Latency</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">OTA Feeds (Expedia, Booking, GDS):</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {syncStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Overbooking Prevention Guardrail:</span>
                  <span className="text-cyan-400 font-bold">Autonomous Lock Active</span>
                </div>
              </div>

              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50"
              >
                <Activity className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing 20,000+ Feeds...' : 'Simulate 1-Click Parity Handshake'}</span>
              </button>
            </div>
          )}

          {/* SLIDE 4: INTERACTIVE AI CONCIERGE PROMPT TESTER */}
          {activeIdx === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Copilot Dispatch Preview</span>
                </div>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Autonomous LLM
                </span>
              </div>

              {/* Sample Prompt Quick Chips */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold">Test Guest Prompt:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { prompt: 'Extra towels & tea for 102', reply: 'Floor steward dispatched to Suite 102 with hypoallergenic towels & herbal tea.' },
                    { prompt: 'Order Artisan Truffle Risotto', reply: 'Executive Chef kitchen confirmed order #CK-891. Estimated prep: 22 mins.' },
                    { prompt: 'Extend checkout to 14:00', reply: 'Late departure granted until 14:00 for Room 102. PMS digital folio updated.' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handlePromptSelect(item.prompt, item.reply)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-300 transition-colors cursor-pointer"
                    >
                      &ldquo;{item.prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Chat Bubble Preview */}
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-2 text-xs">
                <div className="text-slate-400 flex items-center gap-1.5">
                  <span className="font-bold text-purple-400">Guest:</span>
                  <span>&ldquo;{conciergePrompt}&rdquo;</span>
                </div>
                <div className="text-slate-200 flex items-start gap-1.5 pt-1 border-t border-slate-800">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <span className="leading-relaxed">{conciergeReply}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

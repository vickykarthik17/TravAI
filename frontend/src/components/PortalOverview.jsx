import React from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  Percent,
  TrendingUp,
  Globe,
  Compass,
  Sparkles,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, formatRelativeTime } from '../utils/date';
import { LinearShowcaseSlider } from './LinearShowcaseSlider';

const Stat = ({ label, value, detail, icon: Icon, tone, accentGlow }) => (
  <div className={`p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl border-l-4 ${tone} transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 ${accentGlow}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-white font-display">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{detail}</p>
      </div>
      <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
    </div>
  </div>
);

export const PortalOverview = ({ metrics, auditLogs, onNavigate, currency = 'USD' }) => {
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Enterprise Operations</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-3 h-3 text-amber-400" /> 5-Star Luxury Resort Operations
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">
            Resort Operations &amp; Guest Experience Pulse
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-3xl">
            A unified real-time operational cockpit across PMS room rack, AI pricing, 20k+ channels, marketplace bookings, and AI guest concierge.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl px-4 py-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Resort Front Desk Synchronized</span>
        </div>
      </section>

      {/* Linear-Style Interactive Auto-Slider Showcase */}
      <LinearShowcaseSlider onNavigate={onNavigate} currency={currency} />

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="Occupancy Rate"
          value={metrics ? `${metrics.occupancy_percentage}%` : '---'}
          detail={metrics ? `${metrics.occupied_rooms} of ${metrics.total_rooms} rooms occupied` : 'Connecting...'}
          icon={Percent}
          tone="border-blue-400"
          accentGlow="hover:shadow-[0_0_25px_rgba(59,130,246,0.18)]"
        />
        <Stat
          label="RevPAR (Yield)"
          value={metrics ? formatCurrency(metrics.revpar, currency) : '---'}
          detail="Revenue per available room"
          icon={DollarSign}
          tone="border-emerald-400"
          accentGlow="hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]"
        />
        <Stat
          label="Average Daily Rate (ADR)"
          value={metrics ? formatCurrency(metrics.adr, currency) : '---'}
          detail="Active average rate"
          icon={TrendingUp}
          tone="border-cyan-400"
          accentGlow="hover:shadow-[0_0_25px_rgba(6,182,212,0.18)]"
        />
        <Stat
          label="Pending Approvals"
          value={metrics?.pending_approvals ?? '---'}
          detail="Corporate travel workflows"
          icon={ClipboardList}
          tone="border-purple-400"
          accentGlow="hover:shadow-[0_0_25px_rgba(168,85,247,0.18)]"
        />
      </section>

      {/* Core Functional Modules Navigation Hub */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">Core Functional Modules &amp; Key Capabilities</h3>
            <p className="text-xs text-slate-400 mt-1">Direct access to the 8 primary platform engines.</p>
          </div>
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('FRONT_DESK')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Building2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">Cloud PMS &amp; Rack</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Contactless check-in, digital keys, and room rack.</p>
            </div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">PMS Module A</span>
          </button>

          <button
            onClick={() => onNavigate('REVENUE_MANAGER')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">AI Revenue Manager</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">ML demand forecasting and rate guardrails.</p>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Pricing Module B</span>
          </button>

          <button
            onClick={() => onNavigate('CHANNELS')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Globe className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-indigo-400 transition-colors">Distribution Channels</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">20,000+ OTA, GDS &amp; parity sync.</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Channel Module C</span>
          </button>

          <button
            onClick={() => onNavigate('MARKETPLACE')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Compass className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-purple-400 transition-colors">Travel Marketplace</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Multi-modal booking &amp; dynamic packages.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Booking Module D</span>
          </button>

          <button
            onClick={() => onNavigate('AI_CONCIERGE')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">AI Guest Concierge</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">In-stay IoT controls, dining &amp; itinerary.</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Experience Module E</span>
          </button>

          <button
            onClick={() => onNavigate('SUPER_APP')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-pink-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <Smartphone className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-pink-400 transition-colors">Super App &amp; Loyalty</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Wallet, points, vault &amp; AR navigation.</p>
            </div>
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Loyalty Module F</span>
          </button>

          <button
            onClick={() => onNavigate('ANALYTICS')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <BarChart3 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">Enterprise Analytics</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Benchmarking, expenses &amp; exports.</p>
            </div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Section 4 BI</span>
          </button>

          <button
            onClick={() => onNavigate('AUDIT_LOGS')}
            className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-teal-500/50 hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(20,184,166,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2 group-hover:text-teal-400 transition-colors">Hospitality Governance</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Immutable resort compliance &amp; operations audit trail.</p>
            </div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Audit &amp; Compliance</span>
          </button>
        </div>
      </section>

      {/* Recent Ledger Events */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Recent System &amp; Governance Events</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest timestamped actions across users and AI agents.</p>
          </div>
          <Clock3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-2.5">
          {recentLogs.length ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-900/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {log.action.replaceAll('_', ' ')}: <span className="font-normal text-slate-400">{log.details}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Actor: <strong className="text-cyan-400">{log.actor}</strong> · Target: {log.target_type} ({log.target_id})
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 whitespace-nowrap bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-sm">
                  {formatRelativeTime(log.timestamp)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
              <AlertCircle className="w-4 h-4" />
              <span>No audit logs recorded yet.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

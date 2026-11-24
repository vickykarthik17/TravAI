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

const Stat = ({ label, value, detail, icon: Icon, tone }) => (
  <div className={`glass-card p-5 border-l-4 ${tone}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900 font-display">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </div>
      <Icon className="w-5 h-5 text-slate-400" />
    </div>
  </div>
);

export const PortalOverview = ({ metrics, auditLogs, onNavigate, currency = 'USD' }) => {
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="module-header module-header-blue flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Enterprise Operations</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-600" /> Next-Gen AI Hospitality
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">
            Welcome to the Property &amp; Distribution Pulse
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            A unified real-time operational cockpit across PMS room rack, AI pricing, 20k+ channels, marketplace bookings, and AI guest concierge.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 shadow-sm">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Real-time Telemetry Connected</span>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat
          label="Occupancy Rate"
          value={metrics ? `${metrics.occupancy_percentage}%` : '---'}
          detail={metrics ? `${metrics.occupied_rooms} of ${metrics.total_rooms} rooms occupied` : 'Connecting...'}
          icon={Percent}
          tone="border-blue-400"
        />
        <Stat
          label="RevPAR (Yield)"
          value={metrics ? formatCurrency(metrics.revpar, currency) : '---'}
          detail="Revenue per available room"
          icon={DollarSign}
          tone="border-emerald-400"
        />
        <Stat
          label="Average Daily Rate (ADR)"
          value={metrics ? formatCurrency(metrics.adr, currency) : '---'}
          detail="Active average rate"
          icon={TrendingUp}
          tone="border-cyan-400"
        />
        <Stat
          label="Pending Approvals"
          value={metrics?.pending_approvals ?? '---'}
          detail="Corporate travel workflows"
          icon={ClipboardList}
          tone="border-purple-400"
        />
      </section>

      {/* Core Functional Modules Navigation Hub */}
      <section className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Core Functional Modules &amp; Key Capabilities</h3>
            <p className="text-xs text-slate-500 mt-1">Direct access to the 8 primary platform engines.</p>
          </div>
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('FRONT_DESK')}
            className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <Building2 className="w-5 h-5 text-blue-600" />
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Cloud PMS &amp; Rack</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Contactless check-in, digital keys, and room rack.</p>
            </div>
            <span className="text-[10px] font-bold text-blue-700 uppercase">PMS Module A</span>
          </button>

          <button
            onClick={() => onNavigate('REVENUE_MANAGER')}
            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">AI Revenue Manager</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">ML demand forecasting and rate guardrails.</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-700 uppercase">Pricing Module B</span>
          </button>

          <button
            onClick={() => onNavigate('CHANNELS')}
            className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-100 hover:bg-cyan-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <Globe className="w-5 h-5 text-cyan-600" />
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Distribution Channels</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">20,000+ OTA, GDS &amp; parity sync.</p>
            </div>
            <span className="text-[10px] font-bold text-cyan-700 uppercase">Channel Module C</span>
          </button>

          <button
            onClick={() => onNavigate('MARKETPLACE')}
            className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 hover:bg-purple-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <Compass className="w-5 h-5 text-purple-600" />
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Travel Marketplace</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Multi-modal booking &amp; dynamic packages.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-700 uppercase">Booking Module D</span>
          </button>

          <button
            onClick={() => onNavigate('AI_CONCIERGE')}
            className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">AI Guest Concierge</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">In-stay IoT controls, dining &amp; itinerary.</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Experience Module E</span>
          </button>

          <button
            onClick={() => onNavigate('SUPER_APP')}
            className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 hover:bg-pink-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <Smartphone className="w-5 h-5 text-pink-600" />
                <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Super App &amp; Loyalty</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Wallet, points, vault &amp; AR navigation.</p>
            </div>
            <span className="text-[10px] font-bold text-pink-700 uppercase">Loyalty Module F</span>
          </button>

          <button
            onClick={() => onNavigate('ANALYTICS')}
            className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 hover:bg-slate-200/60 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <BarChart3 className="w-5 h-5 text-slate-700" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Enterprise Analytics</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Benchmarking, expenses &amp; exports.</p>
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase">Section 4 BI</span>
          </button>

          <button
            onClick={() => onNavigate('AUDIT_LOGS')}
            className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 hover:bg-teal-100/70 transition-all text-left flex flex-col justify-between h-32 group cursor-pointer shadow-sm hover:shadow"
          >
            <div>
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Audit Governance</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Immutable SOC2-ready ledger trail.</p>
            </div>
            <span className="text-[10px] font-bold text-teal-700 uppercase">Section 7 Audit</span>
          </button>
        </div>
      </section>

      {/* Recent Ledger Events */}
      <section className="glass-card p-5 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">Recent System &amp; Governance Events</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest timestamped actions across users and AI agents.</p>
          </div>
          <Clock3 className="w-5 h-5 text-slate-400" />
        </div>
        <div className="space-y-2.5">
          {recentLogs.length ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {log.action.replaceAll('_', ' ')}: <span className="font-normal text-slate-600">{log.details}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Actor: <strong className="text-indigo-600">{log.actor}</strong> · Target: {log.target_type} ({log.target_id})
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-3">
              <AlertCircle className="w-4 h-4" />
              <span>No audit logs recorded yet.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

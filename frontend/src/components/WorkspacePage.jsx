import React, { useState } from 'react';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Home,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  User,
  ShieldCheck,
  Key,
  Clock,
  Edit3,
} from 'lucide-react';

const pageConfig = {
  BOOKINGS: {
    title: 'Booking Desk',
    eyebrow: 'Reservations workspace',
    description: 'Monitor room demand and move quickly into the live front desk workflow.',
    icon: CalendarDays,
  },
  HOUSEKEEPING: {
    title: 'Housekeeping Board',
    eyebrow: 'Service operations',
    description: 'Track rooms that need cleaning, inspection, or maintenance attention.',
    icon: Home,
  },
  SETTINGS: {
    title: 'Operator Profile & Portal Settings',
    eyebrow: 'Workspace & Security Preferences',
    description: 'Manage operator profile, system notifications, regional defaults, and security credentials.',
    icon: Settings2,
  },
};

export const WorkspacePage = ({
  page,
  rooms = [],
  metrics,
  onNavigate,
  user,
  onOpenProfile,
  currency = 'USD',
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [parityAlerts, setParityAlerts] = useState(true);

  const config = pageConfig[page] || pageConfig.SETTINGS;
  const Icon = config.icon;
  const pendingRooms = rooms.filter((room) => ['Dirty', 'Maintenance'].includes(room.status));
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied');

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">{config.eyebrow}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3 h-3 text-cyan-400" /> System Active
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">{config.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{config.description}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </section>

      {page === 'BOOKINGS' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Summary label="Occupied Rooms" value={metrics?.occupied_rooms ?? occupiedRooms.length} tone="border-blue-500" />
            <Summary label="Available Rooms" value={metrics?.available_rooms ?? 0} tone="border-emerald-500" />
            <Summary label="Occupancy Rate" value={metrics ? `${metrics.occupancy_percentage}%` : '---'} tone="border-cyan-500" />
          </div>
          <ActionPanel title="Reservation Workflow" icon={Sparkles}>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create walk-ins, assign suites, manage keys, and execute digital check-in/check-out from the live PMS room rack.
            </p>
            <ActionButton label="Open Front Desk / PMS" onClick={() => onNavigate('FRONT_DESK')} />
          </ActionPanel>
        </>
      )}

      {page === 'HOUSEKEEPING' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Summary label="Needs Attention" value={pendingRooms.length} tone="border-amber-500" />
            <Summary label="Dirty Rooms" value={rooms.filter((room) => room.status === 'Dirty').length} tone="border-orange-500" />
            <Summary label="Maintenance Blocks" value={rooms.filter((room) => room.status === 'Maintenance').length} tone="border-rose-500" />
          </div>
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Attention Queue</h3>
                <p className="text-xs text-slate-400 mt-0.5">Rooms requiring immediate housekeeping turnaround or maintenance clearing.</p>
              </div>
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div className="space-y-2.5">
              {pendingRooms.length ? (
                pendingRooms.slice(0, 5).map((room) => (
                  <div key={room.id} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-900/90 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-white">Room {room.room_number}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{room.room_type} &bull; {room.housekeeping_note || 'Standard turnaround required'}</p>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1">
                      {room.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-emerald-400 flex items-center gap-2 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All rooms are currently clean and available.
                </p>
              )}
            </div>
            <ActionButton label="Manage Rooms in PMS" onClick={() => onNavigate('FRONT_DESK')} />
          </div>
        </>
      )}

      {page === 'SETTINGS' && (
        <div className="space-y-6">
          {/* Operator Profile Master Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/25 shrink-0">
                  {user?.full_name?.charAt(0) || 'P'}
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-white font-display">{user?.full_name || 'Portal Administrator'}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {user?.role || 'Front Desk Staff'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {user?.email || 'admin@grandresort.com'} &bull; Grand Resort &amp; Convention &bull; <strong className="text-emerald-400 font-semibold">Verified Online</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer self-start sm:self-center"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Full Profile &amp; Preferences</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Workspace Preferences */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-display">Workspace Notification Rules</h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-white">Live Alert Notifications</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Show real-time toast alerts for pending operational tasks.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-white">OTA Rate Parity Push Toasts</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Alert immediately when competitor rate disparity exceeds 5%.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={parityAlerts}
                    onChange={(e) => setParityAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                  <div>
                    <span className="block text-xs font-bold text-white">Background Resort Data Auto-Sync</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Poll PMS rack occupancy and AI revenue suggestions every 60s.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSyncEnabled}
                    onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                <Bell className="w-3.5 h-3.5" />
                <span>Alert triggers are active and operational.</span>
              </div>
            </div>

            {/* Resort Operations & Governance Status */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-display">Resort PMS &amp; Hospitality Governance</h3>
              </div>

              <div className="space-y-2.5">
                <StatusRow label="Live Room Inventory" value={`${rooms.length} Suites Synchronized`} />
                <StatusRow label="Cloud Cluster Target" value="cluster0.tf8lwiu.mongodb.net" isMono />
                <StatusRow label="Operator Duty Credential" value="OP-7742-RESORT" isMono />
                <StatusRow label="Resort Core Engine" value="FastAPI + React 5-Star PMS Synchronized" />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-cyan-300 border border-cyan-800/50 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                >
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open Operator Profile Drawer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({ label, value, tone }) => (
  <div className={`p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 ${tone}`}>
    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-black text-white font-display">{value}</p>
  </div>
);

const ActionPanel = ({ title, icon: Icon, children }) => (
  <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-3">
    <div className="flex items-center gap-2.5">
      <Icon className="w-5 h-5 text-cyan-400" />
      <h3 className="text-lg font-bold text-white font-display">{title}</h3>
    </div>
    {children}
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
  >
    <span>{label}</span>
    <ChevronRight className="w-4 h-4" />
  </button>
);

const StatusRow = ({ label, value, isMono }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
    <span className="text-slate-400">{label}</span>
    <span className={`font-bold text-slate-100 ${isMono ? 'font-mono text-cyan-400' : ''}`}>{value}</span>
  </div>
);

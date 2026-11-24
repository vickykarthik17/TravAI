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
    title: 'Portal Settings',
    eyebrow: 'Workspace preferences',
    description: 'Control lightweight workspace preferences for the current operator.',
    icon: Settings2,
  },
};

export const WorkspacePage = ({ page, rooms, metrics, onNavigate }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const config = pageConfig[page];
  const Icon = config.icon;
  const pendingRooms = rooms.filter((room) => ['Dirty', 'Maintenance'].includes(room.status));
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied');

  return (
    <div className="space-y-6">
      <section className="module-header module-header-indigo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{config.eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">{config.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{config.description}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-white/80 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
      </section>

      {page === 'BOOKINGS' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Summary label="Occupied rooms" value={metrics?.occupied_rooms ?? occupiedRooms.length} tone="border-blue-400" />
            <Summary label="Available rooms" value={metrics?.available_rooms ?? 0} tone="border-emerald-400" />
            <Summary label="Occupancy rate" value={metrics ? `${metrics.occupancy_percentage}%` : '---'} tone="border-indigo-400" />
          </div>
          <ActionPanel title="Reservation workflow" icon={Sparkles}>
            <p className="text-sm text-slate-600">Create walk-ins, assign rooms, and manage guest status from the live PMS room rack.</p>
            <ActionButton label="Open Front Desk / PMS" onClick={() => onNavigate('FRONT_DESK')} />
          </ActionPanel>
        </>
      )}

      {page === 'HOUSEKEEPING' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Summary label="Needs attention" value={pendingRooms.length} tone="border-amber-400" />
            <Summary label="Dirty rooms" value={rooms.filter((room) => room.status === 'Dirty').length} tone="border-orange-400" />
            <Summary label="Maintenance" value={rooms.filter((room) => room.status === 'Maintenance').length} tone="border-rose-400" />
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">Attention queue</h3>
                <p className="text-xs text-slate-500 mt-1">Rooms requiring a housekeeping or engineering update.</p>
              </div>
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-2">
              {pendingRooms.length ? pendingRooms.slice(0, 5).map((room) => (
                <div key={room.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Room {room.room_number}</p>
                    <p className="text-xs text-slate-500">{room.room_type} · {room.housekeeping_note || 'No note added'}</p>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">{room.status}</span>
                </div>
              )) : <p className="text-sm text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> All rooms are currently clear.</p>}
            </div>
            <ActionButton label="Manage rooms in PMS" onClick={() => onNavigate('FRONT_DESK')} />
          </div>
        </>
      )}

      {page === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-3"><SlidersHorizontal className="w-5 h-5 text-indigo-500" /><h3 className="text-lg font-bold text-slate-900 font-display">Workspace preferences</h3></div>
            <label className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span><span className="block text-sm font-semibold text-slate-800">Live notifications</span><span className="block text-xs text-slate-500 mt-1">Show alerts for pending operational work.</span></span>
              <input type="checkbox" checked={notificationsEnabled} onChange={(event) => setNotificationsEnabled(event.target.checked)} className="h-4 w-4 accent-indigo-600" />
            </label>
            <div className="flex items-center gap-2 text-xs text-emerald-700"><Bell className="w-4 h-4" /> Notifications are {notificationsEnabled ? 'enabled' : 'paused'}.</div>
          </div>
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-display">System status</h3>
            <StatusRow label="Room data" value={`${rooms.length} rooms loaded`} />
            <StatusRow label="Metrics service" value={metrics ? 'Connected' : 'Waiting'} />
            <StatusRow label="Portal mode" value="Operations" />
          </div>
        </div>
      )}
    </div>
  );
};

const Summary = ({ label, value, tone }) => (
  <div className={`glass-card p-5 border-l-4 ${tone}`}><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900 font-display">{value}</p></div>
);

const ActionPanel = ({ title, icon: Icon, children }) => (
  <div className="glass-card p-5"><div className="flex items-center gap-2 mb-3"><Icon className="w-5 h-5 text-indigo-500" /><h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3></div>{children}</div>
);

const ActionButton = ({ label, onClick }) => (
  <button onClick={onClick} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900">{label}<ChevronRight className="w-4 h-4" /></button>
);

const StatusRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>
);

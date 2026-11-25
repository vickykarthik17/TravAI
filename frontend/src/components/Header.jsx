import React, { useState } from 'react';
import {
  Building2,
  LayoutDashboard,
  CalendarDays,
  Home,
  Settings2,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  Percent,
  DollarSign,
  Hotel,
  RefreshCw,
  LogOut,
  User,
  ArrowRight,
  ClipboardList,
  Zap,
  Globe,
  Compass,
  Sparkles,
  Smartphone,
  BarChart3,
  Search,
  Bell,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react';
import { formatCurrency, CURRENCY_RATES } from '../utils/currency';
import { LANGUAGES, getTranslation } from '../utils/i18n';

const TABS = [
  { id: 'OVERVIEW', label: 'Resort Pulse & Overview', icon: LayoutDashboard, activeClass: 'nav-tab-active-blue' },
  { id: 'FRONT_DESK', label: 'Front Desk & Suite PMS', icon: Building2, activeClass: 'nav-tab-active-blue' },
  { id: 'REVENUE_MANAGER', label: 'Dynamic Pricing & Yield AI', icon: TrendingUp, activeClass: 'nav-tab-active-indigo' },
  { id: 'CHANNELS', label: 'Global Travel Distribution', icon: Globe, activeClass: 'nav-tab-active-cyan' },
  { id: 'MARKETPLACE', label: 'Curated Luxury Marketplace', icon: Compass, activeClass: 'nav-tab-active-purple' },
  { id: 'AI_CONCIERGE', label: 'VIP AI Guest Butler', icon: Sparkles, activeClass: 'nav-tab-active-emerald' },
  { id: 'SUPER_APP', label: 'Guest Super App & Loyalty', icon: Smartphone, activeClass: 'nav-tab-active-pink' },
  { id: 'CORPORATE_ADMIN', label: 'Corporate Travel Desk', icon: Briefcase, activeClass: 'nav-tab-active-purple' },
  { id: 'ANALYTICS', label: 'Executive Intelligence & BI', icon: BarChart3, activeClass: 'nav-tab-active-blue' },
  { id: 'AUDIT_LOGS', label: 'Hospitality Audit Ledger', icon: ShieldCheck, activeClass: 'nav-tab-active-emerald' },
  { id: 'SETTINGS', label: 'Operator Profile & Settings', icon: User, activeClass: 'nav-tab-active-blue' },
];

export const Header = ({
  currentRole,
  onRoleChange,
  metrics,
  onRefresh,
  isRefreshing,
  user,
  onLogout,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  onOpenProfile,
  onOpenCommandPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'AI Surge Forecast Active', desc: 'Regional Tech Summit lift +18% detected across OTAs', time: '5m ago' },
    { id: 2, title: 'Corporate Request Cleared', desc: 'Jonathan Miller travel request approved under tier rate', time: '12m ago' },
    { id: 3, title: 'Room 101 Order Placed', desc: 'Artisan Truffle Risotto dispatched to in-room dining', time: '20m ago' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#080C1A]/95 backdrop-blur-2xl border-b border-slate-800/90 shadow-2xl md:fixed md:inset-y-0 md:left-0 md:w-80 md:border-r md:border-b-0 md:overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] md:h-1.5" />

        <div className="px-4 sm:px-6 md:px-5 py-3 md:py-5 flex flex-col justify-between gap-4 md:min-h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 border border-amber-300/40 shrink-0">
                <Hotel className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-cyan-200 to-white bg-clip-text text-transparent font-display">
                  Nexgile-TravAI
                </h1>
                <p className="text-[11px] text-amber-300/90 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Grand Resort &bull; 5-Star Luxury Edition
                </p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Global Command / Search Bar (Sidebar) */}
          <div className="relative">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-all cursor-pointer group shadow-sm hover:border-cyan-500/40"
              title="Search commands, rooms, actions (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors absolute left-3 top-2.5" />
              <span className="truncate">{searchQuery || 'Command menu...'}</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-slate-950 border border-slate-800 shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.2)]">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Currency & Language Controls Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Object.keys(CURRENCY_RATES).map((c) => (
                <option key={c} value={c}>
                  {c} ({CURRENCY_RATES[c].symbol})
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-200 font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Tabs List */}
          <nav
            className={`w-full md:flex-1 md:flex md:flex-col md:space-y-1 md:pt-2 md:border-t md:border-slate-800/80 ${
              mobileMenuOpen ? 'flex flex-col space-y-1 pt-2' : 'hidden md:flex'
            }`}
          >
            {TABS.map(({ id, label, icon: Icon, activeClass }) => {
              const isActive = currentRole === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    onRoleChange(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? `${activeClass} bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.25)] font-bold`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Operator Section */}
          <div className="w-full pt-3 border-t border-slate-800/80 space-y-2.5">
            {/* Quick KPI snapshot */}
            <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0c1222]/95 border border-amber-500/25 text-xs space-y-2 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Resort Occupancy
                </span>
                <span className="text-amber-400 font-black text-xs">{metrics ? `${metrics.occupancy_percentage}%` : '---'}</span>
              </div>
              <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(metrics?.occupancy_percentage || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-0.5 text-xs">
                <span className="text-slate-400 font-medium">RevPAR (Yield):</span>
                <strong className="text-emerald-400 font-bold tracking-tight text-sm">
                  {metrics ? formatCurrency(metrics.revpar, currency) : '---'}
                </strong>
              </div>
            </div>

            {/* Operator Profile Card (Full Width - Zero Truncation!) */}
            {user && (
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/40 transition-all space-y-2 group shadow-lg">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="w-full flex items-center gap-3 text-left cursor-pointer"
                  title="Click to view & edit operator profile"
                >
                  <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                    {user.full_name?.charAt(0) || 'P'}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 shadow-[0_0_6px_#34d399]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-tight">
                        {user.full_name || 'Portal Administrator'}
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/60 shrink-0">
                        Edit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                      {user.role || 'Front Desk Staff'}
                    </p>
                  </div>
                </button>

                {/* Quick Action Toolbar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>5-Star PMS Online</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 relative">
                    {/* Notification Bell */}
                    <button
                      type="button"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 border border-slate-800/80 relative cursor-pointer transition-colors"
                      title="Notifications"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-0.5 right-0.5 animate-pulse" />
                    </button>

                    {/* Notifications Popover */}
                    {showNotifications && (
                      <div className="absolute bottom-10 right-0 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-3 z-50 animate-fadeIn text-xs space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="font-bold text-slate-100">Live Resort Notifications</span>
                          <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-200">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {notifications.map((n) => (
                          <div key={n.id} className="p-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 transition-colors">
                            <p className="font-bold text-slate-200 text-[11px]">{n.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{n.desc}</p>
                            <p className="text-[9px] text-slate-500 mt-1">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={onRefresh}
                      disabled={isRefreshing}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800/80 cursor-pointer transition-colors"
                      title="Refresh Resort Data"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800/80 cursor-pointer transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

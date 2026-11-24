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
  { id: 'OVERVIEW', label: 'Overview & Pulse', icon: LayoutDashboard, activeClass: 'nav-tab-active-blue' },
  { id: 'FRONT_DESK', label: 'Front Desk / PMS', icon: Building2, activeClass: 'nav-tab-active-blue' },
  { id: 'REVENUE_MANAGER', label: 'AI Revenue & Yield', icon: TrendingUp, activeClass: 'nav-tab-active-indigo' },
  { id: 'CHANNELS', label: 'Distribution & Channels', icon: Globe, activeClass: 'nav-tab-active-cyan' },
  { id: 'MARKETPLACE', label: 'Travel Marketplace', icon: Compass, activeClass: 'nav-tab-active-purple' },
  { id: 'AI_CONCIERGE', label: 'AI Guest Concierge', icon: Sparkles, activeClass: 'nav-tab-active-emerald' },
  { id: 'SUPER_APP', label: 'Mobile App & Loyalty', icon: Smartphone, activeClass: 'nav-tab-active-pink' },
  { id: 'CORPORATE_ADMIN', label: 'Corporate Approvals', icon: Briefcase, activeClass: 'nav-tab-active-purple' },
  { id: 'ANALYTICS', label: 'Enterprise Analytics', icon: BarChart3, activeClass: 'nav-tab-active-blue' },
  { id: 'AUDIT_LOGS', label: 'Audit Trail Ledger', icon: ShieldCheck, activeClass: 'nav-tab-active-emerald' },
  { id: 'SETTINGS', label: 'Settings', icon: Settings2, activeClass: 'nav-tab-active-slate' },
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-md md:fixed md:inset-y-0 md:left-0 md:w-72 md:border-r md:border-b-0 md:overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 md:h-2" />

        <div className="px-4 sm:px-6 md:px-5 py-3 md:py-5 flex flex-col justify-between gap-4 md:min-h-full">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                <Hotel className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent font-display">
                  Nexgile-TravAI
                </h1>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  Grand Resort &amp; Convention
                </p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Global Search Bar (Sidebar) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search rooms, PNR, guests..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Currency & Language Controls Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
              className="px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
            className={`w-full md:flex-1 md:flex md:flex-col md:space-y-1 md:pt-2 md:border-t md:border-indigo-100 ${
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
                      ? `${activeClass} bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25`
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Operator Section */}
          <div className="w-full pt-3 border-t border-indigo-100 space-y-3">
            {/* Quick KPI snapshot */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                <span>Occupancy</span>
                <span className="text-blue-600 font-black">{metrics ? `${metrics.occupancy_percentage}%` : '---'}</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${metrics?.occupancy_percentage || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-500">RevPAR:</span>
                <strong className="text-emerald-700">{metrics ? formatCurrency(metrics.revpar, currency) : '---'}</strong>
              </div>
            </div>

            {/* User & Actions */}
            <div className="flex items-center justify-between gap-2">
              {user && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0 relative">
                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
                </button>

                {/* Notifications Popover */}
                {showNotifications && (
                  <div className="absolute bottom-12 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-fadeIn text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-900">Live Notifications</span>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <p className="font-bold text-slate-800 text-[11px]">{n.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{n.desc}</p>
                        <p className="text-[9px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 cursor-pointer"
                  title="Refresh Live Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

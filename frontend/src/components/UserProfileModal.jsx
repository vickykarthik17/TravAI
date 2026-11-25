import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Briefcase,
  Clock,
  Globe,
  DollarSign,
  Bell,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
  Camera,
  Key,
  ShieldCheck,
  Building,
  Phone,
  Database,
  Server
} from 'lucide-react';
import { CURRENCY_RATES } from '../utils/currency';
import { LANGUAGES } from '../utils/i18n';
import { api } from '../services/api';

const AVATAR_PALETTES = [
  { id: 'cyan', label: 'Electric Cyan', gradient: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-400' },
  { id: 'emerald', label: 'Emerald Aurora', gradient: 'from-emerald-400 to-teal-600', ring: 'ring-emerald-400' },
  { id: 'violet', label: 'Cyber Violet', gradient: 'from-purple-500 to-indigo-600', ring: 'ring-purple-400' },
  { id: 'amber', label: 'Solar Amber', gradient: 'from-amber-400 to-orange-600', ring: 'ring-amber-400' },
  { id: 'rose', label: 'Neon Rose', gradient: 'from-rose-500 to-pink-600', ring: 'ring-rose-400' },
];

export const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  currency = 'USD',
  onCurrencyChange,
  language = 'en',
  onLanguageChange,
  onVerifySecurity,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(user?.full_name || 'Portal Administrator');
  const [email, setEmail] = useState(user?.email || 'admin@grandresort.com');
  const [phone, setPhone] = useState(user?.phone || '+1 (415) 890-4421');
  const [role, setRole] = useState(user?.role || 'Front Desk Staff');
  const [shift, setShift] = useState(user?.shift || 'Morning Shift (06:00 - 14:00)');
  const [department, setDepartment] = useState(user?.department || 'Guest Experience & Front Office');
  const [selectedPalette, setSelectedPalette] = useState(user?.avatar_palette || 'cyan');
  
  // Notification Preferences
  const [soundEnabled, setSoundEnabled] = useState(user?.sound_alerts ?? true);
  const [parityAlerts, setParityAlerts] = useState(user?.parity_alerts ?? true);
  const [autoSync, setAutoSync] = useState(user?.auto_sync ?? true);

  // MongoDB Atlas Cloud State
  const [mongoUser, setMongoUser] = useState('');
  const [mongoPass, setMongoPass] = useState('');
  const [mongoStatus, setMongoStatus] = useState(null);
  const [isTestingMongo, setIsTestingMongo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getMongoStatus().then(setMongoStatus).catch(() => {});
    }
  }, [isOpen]);

  const handleTestMongo = async () => {
    setIsTestingMongo(true);
    setMongoStatus(null);
    try {
      const res = await api.configureMongo({
        username: mongoUser,
        password: mongoPass,
        database_name: 'nexgile_travai'
      });
      setMongoStatus(res.test_result || res);
    } catch (err) {
      setMongoStatus({
        connected: false,
        message: err.response?.data?.message || err.message || 'Connection failed'
      });
    } finally {
      setIsTestingMongo(false);
    }
  };

  const [saveNotice, setSaveNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const activePalette = AVATAR_PALETTES.find((p) => p.id === selectedPalette) || AVATAR_PALETTES[0];

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedUser = {
      ...user,
      full_name: fullName,
      email: email,
      phone: phone,
      role: role,
      shift: shift,
      department: department,
      avatar_palette: selectedPalette,
      sound_alerts: soundEnabled,
      parity_alerts: parityAlerts,
      auto_sync: autoSync,
      updated_at: new Date().toISOString(),
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setIsSaving(false);
    setSaveNotice('Profile updated successfully! Preferences saved to system.');
    setTimeout(() => {
      setSaveNotice('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#090D1E] border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Glowing Header Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/60">
          <div className="flex items-center gap-4">
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${activePalette.gradient} text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-cyan-500/20`}>
              {fullName?.charAt(0) || 'U'}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-display">{fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{email}</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-semibold">Active On Duty</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {saveNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Avatar Palette Chooser */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Avatar Glow Theme
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_PALETTES.map((pal) => (
                <button
                  type="button"
                  key={pal.id}
                  onClick={() => setSelectedPalette(pal.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selectedPalette === pal.id
                      ? `bg-slate-800/90 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]`
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${pal.gradient}`} />
                  <span>{pal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal & Operator Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Operator Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  placeholder="e.g. Vicky Karthik"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  placeholder="name@grandresort.com"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Intercom / Direct Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  placeholder="+1 (415) 890-4421"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Assigned Property</label>
                <input
                  type="text"
                  readOnly
                  value="Grand Resort & Convention"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-400 text-xs font-medium cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Role & Operational Shift */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              Role &amp; Shift Assignment
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Operator Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  <option value="Front Desk Staff">Front Desk Staff (PMS Ops)</option>
                  <option value="Reservations Manager">Reservations Manager (Central Calendar)</option>
                  <option value="Housekeeping &amp; Maintenance Supervisor">Housekeeping &amp; Maintenance Supervisor</option>
                  <option value="Revenue Manager">Revenue Manager (AI Yield Strategist)</option>
                  <option value="Hospitality Finance Director">Hospitality Finance Director</option>
                  <option value="Property Administrator">Property Administrator (General Ops)</option>
                  <option value="Channel Manager">Channel Manager (20k+ Distribution)</option>
                  <option value="Corporate Travel Manager">Corporate Travel Manager (Approvals)</option>
                  <option value="Travel Agency Approver">Travel Agency Approver</option>
                  <option value="VIP Guest / Traveler">VIP Guest / Traveler (Super App)</option>
                  <option value="Auditor">System Auditor &amp; Compliance Officer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Shift Schedule</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                  <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                  <option value="Night Audit (22:00 - 06:00)">Night Audit (22:00 - 06:00)</option>
                  <option value="Executive Hours (09:00 - 18:00)">Executive Hours (09:00 - 18:00)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition-all"
                  placeholder="e.g. Guest Experience & Front Office"
                />
              </div>
            </div>
          </div>

          {/* Regional & System Preferences */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Regional &amp; Currency Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Display Currency</label>
                <select
                  value={currency}
                  onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  {Object.keys(CURRENCY_RATES).map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCY_RATES[c].symbol}) &bull; {CURRENCY_RATES[c].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Primary Language</label>
                <select
                  value={language}
                  onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notification & Telemetry Toggles */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              Real-time Alert Toggles
            </h3>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-white">Audio Chimes on Urgent Concierge Requests</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Play notification sound when VIP guest or room service request is dispatched.</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-white">OTA Parity Anomaly Alerts</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Receive immediate push toast when competitor price undercut is detected.</p>
                </div>
                <input
                  type="checkbox"
                  checked={parityAlerts}
                  onChange={(e) => setParityAlerts(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors">
                <div>
                  <p className="font-bold text-white">Automatic 60-Second Resort PMS Sync</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Continuously poll PMS room rack and AI yield engine in the background.</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* MongoDB Atlas Cluster Connection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                MongoDB Atlas Cloud Cluster
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                mongoStatus?.connected
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
              }`}>
                {mongoStatus?.connected ? 'Cluster Connected' : 'Credentials Needed'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  Target Cluster:
                </span>
                <span className="font-mono text-cyan-300 font-bold">cluster0.tf8lwiu.mongodb.net</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Atlas Database Username</label>
                  <input
                    type="text"
                    value={mongoUser}
                    onChange={(e) => setMongoUser(e.target.value)}
                    placeholder="e.g. admin or db_user"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Atlas Database Password</label>
                  <input
                    type="password"
                    value={mongoPass}
                    onChange={(e) => setMongoPass(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {mongoStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  mongoStatus.connected
                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${mongoStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="flex-1 text-[11px] leading-relaxed">{mongoStatus.message}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isTestingMongo}
                onClick={handleTestMongo}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isTestingMongo ? 'Connecting to Cluster...' : 'Connect & Test MongoDB Atlas'}</span>
              </button>
            </div>
          </div>

          {/* Security & Audit Credentials */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Hospitality Operator Duty Clearance:
              </span>
              <strong className="text-emerald-400">5-Star Duty Clearance Active</strong>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Operator Duty ID:
              </span>
              <span className="font-mono text-cyan-300">OP-7742-RESORT</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Resort Ledger State:
              </span>
              <span className="text-slate-300">Connected &amp; Synchronized</span>
            </div>

            {onVerifySecurity && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onVerifySecurity}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Verify Security Credentials (Re-authenticate Session)</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout && onLogout();
              }}
              className="px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 border border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

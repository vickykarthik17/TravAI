import React, { useState } from 'react';
import {
  Hotel,
  Mail,
  Lock,
  User,
  Building2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { api, setAuthToken } from '../services/api';

export const AuthPage = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Front Desk Staff',
    department: '',
  });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await api.login(form.email, form.password);
        setAuthToken(result.access_token);
        localStorage.setItem('travai_user', JSON.stringify(result.user));
        onAuthenticated(result.user);
      } else {
        await api.signup(form);
        setForm((prev) => ({
          ...prev,
          email: prev.email.trim().toLowerCase(),
          full_name: '',
          department: '',
        }));
        setMode('login');
        setSuccess('Account created successfully. Sign in with your new account.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (!err.response) {
        setError('Cannot reach the backend. Make sure the API server is running and try again.');
      } else {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = () => {
    setForm({
      full_name: 'Portal Administrator',
      email: 'admin@nexgile.com',
      password: 'admin123',
      role: 'Front Desk Staff',
      department: 'Operations',
    });
    setMode('login');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen auth-shell flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/60">

        {/* Brand panel */}
        <div className="auth-brand-panel hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 auth-brand-gradient" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -left-10 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                <Hotel className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display">Nexgile-TravAI</h1>
                <p className="text-sm text-white/80">Enterprise Hospitality Portal</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold font-display leading-tight mb-4">
              Manage rooms, revenue &amp; corporate travel in one place.
            </h2>
            <p className="text-white/85 text-sm leading-relaxed max-w-md">
              Secure access to live PMS room rack, AI yield engine, corporate approvals, and full audit governance - all connected to your live database.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { icon: Building2, text: 'Real-time room rack & check-in/out' },
              { icon: Sparkles, text: 'AI-powered dynamic pricing' },
              { icon: ShieldCheck, text: 'SOC2-ready audit trail logging' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm bg-white/10 rounded-xl px-4 py-2.5 border border-white/15 backdrop-blur-sm">
                <Icon className="w-4 h-4 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
              <Hotel className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent font-display">
              Nexgile-TravAI
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to access the operations console'
                : 'Register to get started with the portal'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={update('full_name')}
                    placeholder="Jane Smith"
                    className="auth-input pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@nexgile.com"
                  className="auth-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="••••••••"
                  className="auth-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                  <select value={form.role} onChange={update('role')} className="auth-input">
                    <option>Front Desk Staff</option>
                    <option>Revenue Manager</option>
                    <option>Corporate Travel Admin</option>
                    <option>Auditor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Department (optional)</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={update('department')}
                    placeholder="Operations"
                    className="auth-input"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center mb-3">Quick 1-click demo access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemo}
                className="btn-outline w-full text-xs py-2"
              >
                Front Desk Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    full_name: 'Revenue Manager',
                    email: 'revenue@nexgile.com',
                    password: 'revenue123',
                    role: 'Revenue Manager',
                    department: 'Revenue Management',
                  });
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="btn-outline w-full text-xs py-2 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                Revenue Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import { RoomRackPMS } from './components/RoomRackPMS';
import { RevenueManagerAI } from './components/RevenueManagerAI';
import { CorporateAdmin } from './components/CorporateAdmin';
import { AuditTrailLog } from './components/AuditTrailLog';
import { PortalOverview } from './components/PortalOverview';
import { WorkspacePage } from './components/WorkspacePage';
import { DistributionChannels } from './components/DistributionChannels';
import { TravelMarketplace } from './components/TravelMarketplace';
import { AIConciergeView } from './components/AIConciergeView';
import { MobileSuperAppLoyalty } from './components/MobileSuperAppLoyalty';
import { EnterpriseAnalytics } from './components/EnterpriseAnalytics';
import { FloatingAIWidget } from './components/FloatingAIWidget';
import { api, setAuthToken } from './services/api';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';

const ROLE_MAP = {
  'Front Desk Staff': 'FRONT_DESK',
  'Revenue Manager': 'REVENUE_MANAGER',
  'Corporate Travel Admin': 'CORPORATE_ADMIN',
  'Auditor': 'AUDIT_LOGS',
  'Channel Manager': 'CHANNELS',
  'Traveler': 'SUPER_APP',
};

export function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState('OVERVIEW');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  const [rooms, setRooms] = useState([]);
  const [rates, setRates] = useState([]);
  const [corporateRequests, setCorporateRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('travai_token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        setUser(me);
        setCurrentRole(ROLE_MAP[me.role] || 'OVERVIEW');
      } catch {
        setAuthToken(null);
        localStorage.removeItem('travai_user');
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleAuthenticated = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentRole(ROLE_MAP[loggedInUser.role] || 'OVERVIEW');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setRooms([]);
    setRates([]);
    setCorporateRequests([]);
    setAuditLogs([]);
    setMetrics(null);
  };

  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setApiError(null);
      const [roomsRes, ratesRes, corpRes, logsRes, metricsRes] = await Promise.all([
        api.getRooms(1),
        api.getRevenueRecommendations(),
        api.getCorporateRequests(),
        api.getAuditLogs(50),
        api.getMetrics(),
      ]);
      setRooms(roomsRes);
      setRates(ratesRes);
      setCorporateRequests(corpRes);
      setAuditLogs(logsRes);
      setMetrics(metricsRes);
    } catch (err) {
      console.error('API Fetch Error:', err);
      setApiError('Unable to connect to the backend server. Ensure Uvicorn is running on port 8000 and retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [user, fetchAllData]);

  // Filtered rooms if user typed a search query in Header
  const visibleRooms = searchQuery.trim()
    ? rooms.filter(
        (r) =>
          r.room_number.includes(searchQuery) ||
          r.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.current_guest_name && r.current_guest_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rooms;

  if (authLoading) {
    return (
      <div className="auth-shell min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell min-h-screen text-slate-800 flex flex-col selection:bg-cyan-200 selection:text-slate-900">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        metrics={metrics}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
        user={user}
        onLogout={handleLogout}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 md:ml-72 md:max-w-[calc(100%-18rem)]">
        {apiError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Backend Connection Notice: </span>
                {apiError}
              </div>
            </div>
            <button onClick={fetchAllData} className="btn-danger px-3 py-1.5 text-xs shrink-0 cursor-pointer">
              Retry Connection
            </button>
          </div>
        )}

        {searchQuery.trim() && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-600" />
              Filtering by: <strong>"{searchQuery}"</strong> ({visibleRooms.length} rooms matched)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-900 cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              Loading Nexgile-TravAI Systems State...
            </p>
          </div>
        ) : (
          <>
            {currentRole === 'OVERVIEW' && (
              <PortalOverview
                metrics={metrics}
                auditLogs={auditLogs}
                onNavigate={setCurrentRole}
                currency={currency}
              />
            )}
            {currentRole === 'FRONT_DESK' && (
              <RoomRackPMS
                rooms={visibleRooms}
                onRoomsUpdated={fetchAllData}
                user={user}
                currency={currency}
              />
            )}
            {currentRole === 'REVENUE_MANAGER' && (
              <RevenueManagerAI
                rates={rates}
                onRatesUpdated={fetchAllData}
                user={user}
                currency={currency}
              />
            )}
            {currentRole === 'CHANNELS' && (
              <DistributionChannels currency={currency} />
            )}
            {currentRole === 'MARKETPLACE' && (
              <TravelMarketplace currency={currency} user={user} />
            )}
            {currentRole === 'AI_CONCIERGE' && (
              <AIConciergeView currency={currency} user={user} />
            )}
            {currentRole === 'SUPER_APP' && (
              <MobileSuperAppLoyalty currency={currency} user={user} />
            )}
            {currentRole === 'CORPORATE_ADMIN' && (
              <CorporateAdmin
                requests={corporateRequests}
                onRequestUpdated={fetchAllData}
                user={user}
                currency={currency}
              />
            )}
            {currentRole === 'ANALYTICS' && (
              <EnterpriseAnalytics
                metrics={metrics}
                currency={currency}
                user={user}
              />
            )}
            {currentRole === 'AUDIT_LOGS' && (
              <AuditTrailLog logs={auditLogs} />
            )}
            {['BOOKINGS', 'HOUSEKEEPING', 'SETTINGS'].includes(currentRole) && (
              <WorkspacePage
                page={currentRole}
                rooms={visibleRooms}
                metrics={metrics}
                onNavigate={setCurrentRole}
              />
            )}
          </>
        )}

        {/* Global Floating AI Concierge & Operations Widget */}
        <FloatingAIWidget
          user={user}
          currency={currency}
          onNavigate={setCurrentRole}
        />
      </main>

      <footer className="border-t border-indigo-100/80 bg-white/70 backdrop-blur-sm py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2026{' '}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Nexgile-TravAI
            </span>{' '}
            Autonomous Travel &amp; Hospitality Monorepo.
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
              FastAPI + SQLite Active
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
              React + Vite + Tailwind
            </span>
            <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-semibold">
              Vercel AI SDK
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

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
import { UserProfileModal } from './components/UserProfileModal';
import { LinearCommandPalette } from './components/LinearCommandPalette';
import { SecurityVerificationLoader } from './components/SecurityVerificationLoader';
import { api, setAuthToken } from './services/api';
import { AlertCircle, RefreshCw, Search, ShieldCheck } from 'lucide-react';

const ROLE_MAP = {
  'Front Desk Staff': 'FRONT_DESK',
  'Reservations Manager': 'FRONT_DESK',
  'Housekeeping & Maintenance Supervisor': 'FRONT_DESK',
  'Revenue Manager': 'REVENUE_MANAGER',
  'Channel Manager': 'CHANNELS',
  'Travel Marketplace Agent': 'MARKETPLACE',
  'VIP Guest Concierge': 'AI_CONCIERGE',
  'VIP Guest / Traveler': 'SUPER_APP',
  'Traveler': 'SUPER_APP',
  'Loyalty Member': 'SUPER_APP',
  'Corporate Travel Manager': 'CORPORATE_ADMIN',
  'Corporate Travel Admin': 'CORPORATE_ADMIN',
  'Hospitality Finance Director': 'ANALYTICS',
  'Enterprise & BI Analyst': 'ANALYTICS',
  'Auditor & Compliance Officer': 'AUDIT_LOGS',
  'Auditor': 'AUDIT_LOGS',
  'Property Administrator': 'OVERVIEW',
};

export function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isVerifyingSecurity, setIsVerifyingSecurity] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [currentRole, setCurrentRole] = useState('OVERVIEW');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  // Linear Command Palette Redirection Target States
  const [targetRoomNumber, setTargetRoomNumber] = useState(null);
  const [autoOpenNewBooking, setAutoOpenNewBooking] = useState(false);
  const [targetStatusFilter, setTargetStatusFilter] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const [rooms, setRooms] = useState([]);
  const [rates, setRates] = useState([]);
  const [corporateRequests, setCorporateRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSelectRoom = (roomOrNumber) => {
    const roomNumber = typeof roomOrNumber === 'object' ? roomOrNumber.room_number : roomOrNumber;
    const roomType = typeof roomOrNumber === 'object' ? roomOrNumber.room_type : '';
    setSearchQuery('');
    setCurrentRole('FRONT_DESK');
    setTargetRoomNumber(roomNumber);
    setShowCommandPalette(false);
    showToast(`Redirecting to Room ${roomNumber} (${roomType || 'Suite'}) · Front Desk PMS`);
  };

  const handleNewReservationFromPalette = () => {
    setCurrentRole('FRONT_DESK');
    setAutoOpenNewBooking(true);
    setShowCommandPalette(false);
    showToast('Opening New Reservation Booking Folio');
  };

  const handleSetStatusFilterFromPalette = (status) => {
    setCurrentRole('FRONT_DESK');
    setTargetStatusFilter(status);
    setShowCommandPalette(false);
    showToast(`Filtering Front Desk PMS: ${status} Suites Only`);
  };

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

  // Global Ctrl+K / Cmd+K listener for Linear-style Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAuthenticated = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentRole(ROLE_MAP[loggedInUser.role] || 'OVERVIEW');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('travai_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to save user to storage:', e);
    }
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

  if (isVerifyingSecurity) {
    return <SecurityVerificationLoader onComplete={() => setIsVerifyingSecurity(false)} duration={2400} />;
  }

  if (authLoading) {
    return (
      <div className="auth-shell min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-shell min-h-screen text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
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
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 md:ml-80 md:max-w-[calc(100%-20rem)]">
        {apiError && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 backdrop-blur-xl flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
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
          <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 backdrop-blur-xl flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-400" />
              Filtering by: <strong>"{searchQuery}"</strong> ({visibleRooms.length} rooms matched)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-200 cursor-pointer"
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
                targetRoomNumber={targetRoomNumber}
                onClearTargetRoom={() => setTargetRoomNumber(null)}
                autoOpenNewBooking={autoOpenNewBooking}
                onClearAutoOpenNewBooking={() => setAutoOpenNewBooking(false)}
                targetStatusFilter={targetStatusFilter}
                onClearTargetStatusFilter={() => setTargetStatusFilter(null)}
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
                user={user}
                onOpenProfile={() => setShowProfileModal(true)}
                currency={currency}
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

        {/* Fully Functional Operator Profile & Settings Modal */}
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          currency={currency}
          onCurrencyChange={setCurrency}
          language={language}
          onLanguageChange={setLanguage}
          onVerifySecurity={() => {
            setShowProfileModal(false);
            setIsVerifyingSecurity(true);
          }}
        />

        {/* Linear-Style Fast Command Menu (Ctrl+K) */}
        <LinearCommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(tab) => {
            setCurrentRole(tab);
            showToast(`Switched view to ${tab.replace('_', ' ')}`);
          }}
          onOpenProfile={() => {
            setShowProfileModal(true);
            showToast('Opening Operator Profile & Security Credentials');
          }}
          onRefreshData={() => {
            fetchAllData();
            showToast('Synchronizing Live Telemetry & Rates');
          }}
          onVerifySecurity={() => {
            setShowCommandPalette(false);
            setIsVerifyingSecurity(true);
          }}
          onSelectRoom={handleSelectRoom}
          onNewReservation={handleNewReservationFromPalette}
          onSetStatusFilter={handleSetStatusFilterFromPalette}
          currency={currency}
          onCurrencyChange={(c) => {
            setCurrency(c);
            showToast(`Display Currency set to ${c}`);
          }}
          rooms={rooms}
        />

        {/* Dynamic Feedback Toast for Fast Palette Navigation */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-[999] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-2xl flex items-center gap-2.5 animate-slideDown pointer-events-none">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

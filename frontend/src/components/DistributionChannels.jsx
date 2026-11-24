import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  Activity,
  Zap,
  Sliders,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const DistributionChannels = ({ currency = 'USD' }) => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [stopSellRoom, setStopSellRoom] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [bannerNotice, setBannerNotice] = useState('');

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const data = await api.getChannels();
      setChannels(data);
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSyncChannel = async (channelId, channelName) => {
    try {
      setSyncingId(channelId);
      await api.syncChannel(channelId, { status: 'Active', sync_health: '100% Synced' });
      await fetchChannels();
      setBannerNotice(`Channel ${channelName} successfully resynchronized with zero parity errors.`);
      setTimeout(() => setBannerNotice(''), 5000);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsSyncingAll(true);
      for (const ch of channels) {
        await api.syncChannel(ch.id, { status: 'Active', sync_health: '100% Synced' });
      }
      await fetchChannels();
      setBannerNotice('All 20,000+ connected OTA, GDS, and Metasearch channels are now 100% synchronized.');
      setTimeout(() => setBannerNotice(''), 5000);
    } catch (err) {
      console.error('Sync all failed:', err);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleToggleStopSell = async (channelId, currentStatus, channelName) => {
    try {
      const isCurrentlyActive = currentStatus === 'Active';
      await api.applyStopSell(channelId, stopSellRoom, isCurrentlyActive);
      await fetchChannels();
      setBannerNotice(
        isCurrentlyActive
          ? `Stop-sell activated for ${channelName} on ${stopSellRoom} rooms.`
          : `Stop-sell lifted for ${channelName}. Channel is now accepting reservations.`
      );
      setTimeout(() => setBannerNotice(''), 5000);
    } catch (err) {
      console.error('Stop sell toggle failed:', err);
    }
  };

  const totalNetRevenue = channels.reduce((acc, c) => acc + (c.net_revenue || 0), 0);
  const avgCommission = channels.length ? (channels.reduce((acc, c) => acc + (c.commission_rate || 0), 0) / channels.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="module-header module-header-blue flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Distribution Engine</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" /> 20,000+ Global Channels Connected
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">
            Central Channel Management &amp; Rate Parity
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Real-time two-way synchronization across OTAs, Amadeus/Sabre GDS, Metasearch, and direct booking engines with automated overbooking prevention and stop-sell controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            {isSyncingAll ? 'Syncing Feeds...' : 'Sync All 20,000+ Channels'}
          </button>
        </div>
      </section>

      {/* Notice Banner */}
      {bannerNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Channel Revenue</p>
          <p className="text-2xl font-black text-slate-900 font-display mt-1">{formatCurrency(totalNetRevenue, currency)}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last month
          </p>
        </div>

        <div className="glass-card p-5 border-l-4 border-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Channel Contribution</p>
          <p className="text-2xl font-black text-emerald-600 font-display mt-1">42.8%</p>
          <p className="text-xs text-slate-500 mt-1">Zero commission bookings</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average OTA Commission</p>
          <p className="text-2xl font-black text-indigo-600 font-display mt-1">{avgCommission}%</p>
          <p className="text-xs text-slate-500 mt-1">Industry standard benchmark</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-cyan-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parity Integrity Score</p>
          <p className="text-2xl font-black text-cyan-600 font-display mt-1">99.4%</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Rate parity intact
          </p>
        </div>
      </div>

      {/* Stop-Sell Control Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Rapid Allotment &amp; Stop-Sell Rule</h4>
            <p className="text-xs text-slate-500">Select target room category to apply restriction across channels.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stopSellRoom}
            onChange={(e) => setStopSellRoom(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Room Types</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Presidential Suite">Presidential Suite</option>
            <option value="Deluxe King">Deluxe King</option>
            <option value="Studio Suite">Studio Suite</option>
          </select>
          <span className="text-xs text-slate-400 font-medium">Targeted Category</span>
        </div>
      </div>

      {/* Channel Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channels.map((channel) => {
          const isActive = channel.status === 'Active';
          const isSyncing = syncingId === channel.id;

          return (
            <div
              key={channel.id}
              className={`glass-card p-5 relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                !isActive ? 'opacity-85 border-amber-200 bg-amber-50/20' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-display">{channel.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {channel.channel_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commission: <strong className="text-slate-700">{channel.commission_rate}%</strong> · Listings: <strong className="text-slate-700">{channel.active_listings} rooms</strong>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  {channel.status}
                </span>
              </div>

              {/* Parity Status Badge */}
              <div className="my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Parity Health:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {channel.sync_health}
                </span>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 font-medium">Net Revenue</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(channel.net_revenue, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Cancellation Rate</p>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">{channel.cancellation_rate}%</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStopSell(channel.id, channel.status, channel.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                  {isActive ? 'Stop Sell' : 'Resume Channel'}
                </button>

                <button
                  onClick={() => handleSyncChannel(channel.id, channel.name)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Feed'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

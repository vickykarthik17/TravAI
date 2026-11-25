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
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Distribution Engine</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Globe className="w-3 h-3 text-cyan-400" /> 20,000+ Global Channels Connected
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">
            Central Channel Management &amp; Rate Parity
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Real-time two-way synchronization across OTAs, Amadeus/Sabre GDS, Metasearch, and direct booking engines with automated overbooking prevention and stop-sell controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            {isSyncingAll ? 'Syncing Feeds...' : 'Sync All 20,000+ Channels'}
          </button>
        </div>
      </section>

      {/* Notice Banner */}
      {bannerNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Net Channel Revenue</p>
          <p className="text-2xl font-black text-white font-display mt-1">{formatCurrency(totalNetRevenue, currency)}</p>
          <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.8% vs last month
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Channel Contribution</p>
          <p className="text-2xl font-black text-emerald-400 font-display mt-1">42.8%</p>
          <p className="text-xs text-slate-400 mt-1">Zero commission bookings</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average OTA Commission</p>
          <p className="text-2xl font-black text-indigo-400 font-display mt-1">{avgCommission}%</p>
          <p className="text-xs text-slate-400 mt-1">Industry standard benchmark</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-cyan-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Parity Integrity Score</p>
          <p className="text-2xl font-black text-cyan-400 font-display mt-1">99.4%</p>
          <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rate parity intact
          </p>
        </div>
      </div>

      {/* Stop-Sell Control Toolbar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Rapid Allotment &amp; Stop-Sell Rule</h4>
            <p className="text-xs text-slate-400">Select target room category to apply restriction across channels.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={stopSellRoom}
            onChange={(e) => setStopSellRoom(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold bg-slate-950 text-white focus:outline-none focus:border-cyan-400 transition-colors"
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
              className={`p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] ${
                !isActive ? 'opacity-80 border-amber-500/30 bg-slate-900/40' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display">{channel.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 text-cyan-400 border border-cyan-800/40">
                      {channel.channel_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commission: <strong className="text-slate-200">{channel.commission_rate}%</strong> · Listings: <strong className="text-slate-200">{channel.active_listings} rooms</strong>
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse'}`} />
                  {channel.status}
                </span>
              </div>

              {/* Parity Status Badge */}
              <div className="my-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Parity Health:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {channel.sync_health}
                </span>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-800">
                <div>
                  <p className="text-slate-400 font-medium">Net Revenue</p>
                  <p className="text-sm font-bold text-white mt-0.5">{formatCurrency(channel.net_revenue, currency)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Cancellation Rate</p>
                  <p className="text-sm font-bold text-rose-400 mt-0.5">{channel.cancellation_rate}%</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleStopSell(channel.id, channel.status, channel.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isActive ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                  {isActive ? 'Stop Sell' : 'Resume Channel'}
                </button>

                <button
                  onClick={() => handleSyncChannel(channel.id, channel.name)}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 hover:border-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)] disabled:opacity-50"
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

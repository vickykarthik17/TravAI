import React, { useState } from 'react';
import { 
  Sparkles, 
  Edit3, 
  X, 
  ShieldAlert, 
  ArrowUpRight,
  BrainCircuit,
  RefreshCw,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export const RevenueManagerAI = ({ rates, onRatesUpdated, currency = 'USD' }) => {
  const [selectedRate, setSelectedRate] = useState(null);
  const [overridePrice, setOverridePrice] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [actorName, setActorName] = useState('Revenue Manager (VP Operations)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState(null);

  const handleRecalculateYield = async () => {
    setIsRecalculating(true);
    setRecalculateMessage(null);
    try {
      await api.recalculateRevenueRates();
      if (onRatesUpdated) await onRatesUpdated();
      setRecalculateMessage('AI Yield Engine recalculated rates live using real-time occupancy and competitor parity spreads.');
      setTimeout(() => setRecalculateMessage(null), 5000);
    } catch (err) {
      console.error('Failed to recalculate yield:', err);
      alert('Yield recalculation failed. Please ensure the backend server is active.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleOpenOverride = (rateItem) => {
    setSelectedRate(rateItem);
    setOverridePrice(rateItem.ai_recommended_rate.toFixed(2));
    setOverrideReason('Adjusted based on corporate block negotiation and local demand alignment.');
  };

  const handleConfirmOverride = async (e) => {
    e.preventDefault();
    if (!selectedRate) return;
    setIsSubmitting(true);
    try {
      await api.overrideRate(
        selectedRate.id,
        parseFloat(overridePrice),
        overrideReason,
        actorName
      );
      onRatesUpdated();
      setSelectedRate(null);
      alert('Rate overrode successfully! Human override recorded in system audit log.');
    } catch (err) {
      console.error('Failed to override rate:', err);
      alert('Failed to override rate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceBadge = (score) => {
    const pct = Math.round(score * 100);
    let colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score < 0.90) colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (score < 0.80) colorClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30';

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full ${score >= 0.9 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${colorClass}`}>
          {pct}% Conf.
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & AI Insight Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-display">AI Revenue Optimizer &amp; Yield Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <BrainCircuit className="w-3 h-3 text-cyan-400" />
              Machine Learning Guardrails
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dynamic pricing model driven by competitor rates, local events, and booking pace signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-slate-300 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Strategy</div>
              <div className="font-bold text-amber-300">Surge Profit Maximization</div>
            </div>
          </div>
          <button
            onClick={handleRecalculateYield}
            disabled={isRecalculating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all active:scale-95 disabled:opacity-50"
            title="Execute live machine learning yield calculation against current occupancy and market competitor spreads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Optimizing Rates...' : 'Run Live AI Yield Optimization'}
          </button>
        </div>
      </div>

      {/* Recalculation Alert */}
      {recalculateMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{recalculateMessage}</span>
        </div>
      )}

      {/* Dynamic Rates Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-4 px-4 font-bold text-cyan-400">Room Type</th>
                <th className="py-4 px-4 font-semibold">Target Date</th>
                <th className="py-4 px-4 font-semibold">Current Rate</th>
                <th className="py-4 px-4 font-semibold text-emerald-400">AI Suggested Rate</th>
                <th className="py-4 px-4 font-semibold">ML Confidence Score</th>
                <th className="py-4 px-4 font-semibold">Primary Demand Driver</th>
                <th className="py-4 px-4 font-semibold">Governance Status</th>
                <th className="py-4 px-4 text-right font-semibold">Human Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {rates.map((rate) => {
                const diff = rate.ai_recommended_rate - rate.current_rate;
                const diffPct = ((diff / rate.current_rate) * 100).toFixed(1);

                return (
                  <tr key={rate.id} className="hover:bg-cyan-950/20 transition-colors even:bg-slate-900/40">
                    
                    {/* Room Type */}
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      {rate.room_type}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-medium text-slate-300">
                      {formatDate(rate.date_str)}
                    </td>

                    {/* Current Rate */}
                    <td className="py-4 px-4 font-semibold text-slate-300">
                      {formatCurrency(rate.current_rate, currency)}
                    </td>

                    {/* AI Suggested Rate */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-cyan-400 font-display">
                          {formatCurrency(rate.ai_recommended_rate, currency)}
                        </span>
                        <span className={`text-[11px] font-bold flex items-center ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <ArrowUpRight className="w-3 h-3" />
                          {diff >= 0 ? `+${diffPct}%` : `${diffPct}%`}
                        </span>
                      </div>
                    </td>

                    {/* Confidence Score */}
                    <td className="py-4 px-4">
                      {getConfidenceBadge(rate.confidence_score)}
                    </td>

                    {/* Demand Factor */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-950 text-cyan-300 border border-cyan-800/50 font-medium text-[11px] shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                        {rate.demand_factor}
                      </span>
                    </td>

                    {/* Governance Status */}
                    <td className="py-4 px-4">
                      {rate.status === 'Overridden' ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 w-max">
                          <Edit3 className="w-3.5 h-3.5" />
                          Human Overridden
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 w-max shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          AI Active
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenOverride(rate)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 hover:border-cyan-400 text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Override Rate
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human Override Modal */}
      {selectedRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleConfirmOverride} className="bg-[#0B1021] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative text-white">
            
            <button
              type="button"
              onClick={() => setSelectedRate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-xl font-bold text-white font-display">
                  Human-in-the-Loop Override
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedRate.room_type} &bull; Target Date: {selectedRate.date_str}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>AI Model Rate Recommendation:</span>
                <span className="font-bold text-cyan-400">{formatCurrency(selectedRate.ai_recommended_rate, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Model Confidence Level:</span>
                <span className="font-bold text-emerald-400">{Math.round(selectedRate.confidence_score * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adjusted Override Price ({currency}/night)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Override Justification / Rationale
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the AI model recommendation is being manually overrode..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reviewer Role / Actor Name
                </label>
                <input
                  type="text"
                  required
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRate(null)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Override...' : 'Confirm Rate Override'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

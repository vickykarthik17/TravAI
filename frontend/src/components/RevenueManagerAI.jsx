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
    let colorClass = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    if (score < 0.90) colorClass = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
    if (score < 0.80) colorClass = 'bg-rose-500/10 text-rose-600 border-rose-500/30';

    return (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-white h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full ${score >= 0.9 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colorClass}`}>
          {pct}% Conf.
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & AI Insight Header */}
      <div className="module-header-indigo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-display">AI Revenue Optimizer & Yield Engine</h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-700 border border-indigo-500/30 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-indigo-600" />
              Machine Learning Guardrails
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time dynamic pricing model driven by competitor rates, local events, and booking pace signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs text-slate-600 flex items-center gap-2 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Strategy</div>
              <div className="font-bold text-amber-700">Surge Profit Maximization</div>
            </div>
          </div>
          <button
            onClick={handleRecalculateYield}
            disabled={isRecalculating}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Execute live machine learning yield calculation against current occupancy and market competitor spreads"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            {isRecalculating ? 'Optimizing Rates...' : 'Run Live AI Yield Optimization'}
          </button>
        </div>
      </div>

      {/* Recalculation Alert */}
      {recalculateMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{recalculateMessage}</span>
        </div>
      )}

      {/* Dynamic Rates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="table-head-indigo uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">Room Type</th>
                <th className="py-3.5 px-4 font-semibold">Target Date</th>
                <th className="py-3.5 px-4 font-semibold">Current Rate</th>
                <th className="py-3.5 px-4 font-semibold">AI Suggested Rate</th>
                <th className="py-3.5 px-4 font-semibold">ML Confidence Score</th>
                <th className="py-3.5 px-4 font-semibold">Primary Demand Driver</th>
                <th className="py-3.5 px-4 font-semibold">Governance Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Human Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {rates.map((rate) => {
                const diff = rate.ai_recommended_rate - rate.current_rate;
                const diffPct = ((diff / rate.current_rate) * 100).toFixed(1);

                return (
                  <tr key={rate.id} className="hover:bg-indigo-50/50 transition-colors even:bg-slate-50/50">
                    
                    {/* Room Type */}
                    <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                      {rate.room_type}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 font-medium text-slate-600">
                      {rate.date_str}
                    </td>

                    {/* Current Rate */}
                    <td className="py-4 px-4 font-semibold text-slate-600">
                      {formatCurrency(rate.current_rate, currency)}
                    </td>

                    {/* AI Suggested Rate */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-cyan-700 font-display">
                          {formatCurrency(rate.ai_recommended_rate, currency)}
                        </span>
                        <span className={`text-[11px] font-bold flex items-center ${diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                      <span className="px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-500/20 font-medium text-[11px]">
                        {rate.demand_factor}
                      </span>
                    </td>

                    {/* Governance Status */}
                    <td className="py-4 px-4">
                      {rate.status === 'Overridden' ? (
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 w-max">
                          <Edit3 className="w-3.5 h-3.5" />
                          Human Overridden
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-600 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 w-max">
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Active
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenOverride(rate)}
                        className="btn-indigo ml-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleConfirmOverride} className="bg-white border border-indigo-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-indigo-500/10 relative">
            
            <button
              type="button"
              onClick={() => setSelectedRate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  Human-in-the-Loop Override
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedRate.room_type} &bull; Target Date: {selectedRate.date_str}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>AI Model Rate Recommendation:</span>
                <span className="font-bold text-cyan-600">{formatCurrency(selectedRate.ai_recommended_rate, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Model Confidence Level:</span>
                <span className="font-bold text-emerald-600">{Math.round(selectedRate.confidence_score * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Adjusted Override Price ({currency}/night)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overridePrice}
                  onChange={(e) => setOverridePrice(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Override Justification / Rationale
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the AI model recommendation is being manually overrode..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reviewer Role / Actor Name
                </label>
                <input
                  type="text"
                  required
                  value={actorName}
                  onChange={(e) => setActorName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedRate(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-amber disabled:opacity-50"
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

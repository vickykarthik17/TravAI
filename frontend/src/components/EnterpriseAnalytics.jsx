import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Zap,
  ArrowUpRight,
  Filter,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const EnterpriseAnalytics = ({ metrics, currency = 'USD', user }) => {
  const [insights, setInsights] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState('');

  // New Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expCategory, setExpCategory] = useState('Meals');
  const [expAmount, setExpAmount] = useState('45.00');
  const [expMerchant, setExpMerchant] = useState('Urban Bistro SF');
  const [expDate, setExpDate] = useState('2026-09-09');
  const [expNotes, setExpNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ins, exp, comp] = await Promise.all([
        api.getAIInsights(),
        api.getExpenses(),
        api.getCompetitorRates(),
      ]);
      setInsights(ins || []);
      setExpenses(exp || []);
      setCompetitors(comp || []);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async (type) => {
    try {
      setExportNotice(`Exporting ${type} report as CSV...`);
      await api.exportReport(type);
      setExportNotice(`Successfully downloaded ${type}_report.csv`);
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setExportNotice('Export failed. Please try again.');
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createExpense({
        employee_name: user?.full_name || 'Portal Administrator',
        category: expCategory,
        amount: parseFloat(expAmount),
        currency: 'USD',
        merchant: expMerchant,
        date: expDate,
        notes: expNotes,
      });
      await fetchData();
      setShowExpenseModal(false);
      setExpNotes('');
      setExportNotice('Expense recorded and scanned for corporate policy compliance.');
      setTimeout(() => setExportNotice(''), 4000);
    } catch (err) {
      console.error('Failed to submit expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <section className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">Enterprise Intelligence</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <BarChart3 className="w-3 h-3 text-cyan-400" /> Operational &amp; Financial BI
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-white font-display">
            Enterprise Analytics, Expenses &amp; Proactive Insights
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Real-time portfolio benchmarking, AI anomaly detection, competitor rate tracking, automated corporate expense capture, and self-service audit report exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('rooms')}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rooms CSV</span>
          </button>
          <button
            onClick={() => handleExport('revenue')}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Revenue CSV</span>
          </button>
          <button
            onClick={() => handleExport('audit')}
            className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-cyan-500/40 text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Trail CSV</span>
          </button>
        </div>
      </section>

      {/* Export Notice Banner */}
      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Operational Dashboard Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-blue-500 hover:border-slate-700 transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Room Turnaround Speed</p>
          <p className="text-2xl font-black text-white font-display mt-1">28 mins</p>
          <p className="text-xs text-emerald-400 font-semibold mt-1">7 mins faster than target</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-emerald-500 hover:border-slate-700 transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest CSAT / NPS Score</p>
          <p className="text-2xl font-black text-emerald-400 font-display mt-1">94.8 / 100</p>
          <p className="text-xs text-slate-400 mt-1">Based on 182 verified stay surveys</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-indigo-500 hover:border-slate-700 transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Productivity Index</p>
          <p className="text-2xl font-black text-cyan-400 font-display mt-1">96.2%</p>
          <p className="text-xs text-slate-400 mt-1">100% work orders resolved</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-2xl border-l-4 border-amber-500 hover:border-slate-700 transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expense Policy Compliance</p>
          <p className="text-2xl font-black text-amber-400 font-display mt-1">98.1%</p>
          <p className="text-xs text-slate-400 mt-1">1 exception flagged for review</p>
        </div>
      </div>

      {/* Proactive AI Insights Panel */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white font-display">Proactive AI Operational Insights</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            Real-time Telemetry Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`p-4 rounded-2xl border transition-all ${
                ins.urgency === 'High'
                  ? 'bg-rose-950/30 border-rose-500/30'
                  : ins.urgency === 'Medium'
                  ? 'bg-amber-950/30 border-amber-500/30'
                  : 'bg-cyan-950/30 border-cyan-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950 text-cyan-300 border border-cyan-800/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                  {ins.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    ins.urgency === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : ins.urgency === 'Medium'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  {ins.urgency} Priority &bull; {Math.round(ins.confidence * 100)}% Conf.
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{ins.headline}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ins.details}</p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Action:</span>
                <strong className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer">{ins.suggested_action}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Rate Parity Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display">Competitor Rate Monitoring &amp; Market Parity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time web scraper comparison across local competing luxury hotels.</p>
          </div>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/50 px-3 py-1 rounded-xl border border-cyan-800/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            Updated Hourly
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-cyan-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">Competitor Hotel</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Room Category</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Competitor Rate</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400">Our Direct Rate</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Parity Variance</th>
                <th className="py-3.5 px-4 text-right font-semibold text-slate-300">Yield Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {competitors.map((cp) => {
                const isUnder = cp.parity_difference < 0;

                return (
                  <tr key={cp.id} className="hover:bg-cyan-950/20 transition-colors even:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-white text-xs">{cp.competitor_name}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">{cp.room_type}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-400">{formatCurrency(cp.competitor_rate, currency)}</td>
                    <td className="py-3.5 px-4 font-bold text-cyan-400 text-sm">{formatCurrency(cp.our_rate, currency)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isUnder ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {formatCurrency(Math.abs(cp.parity_difference), currency)} {isUnder ? 'Lower (Competitive)' : 'Higher'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-400">
                      Surge Rate Maintained
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Corporate Travel Expenses & Receipt Capture */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-display">Corporate Expense Management &amp; Policy Checks</h3>
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Submit Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-cyan-400 uppercase font-bold text-[11px] tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Category</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Merchant</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Date</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-slate-300">Policy Check</th>
                <th className="py-3.5 px-4 text-right font-semibold text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-cyan-950/20 transition-colors even:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white">{exp.employee_name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{exp.category}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{exp.merchant}</td>
                  <td className="py-3.5 px-4 text-slate-400">{exp.date}</td>
                  <td className="py-3.5 px-4 font-bold text-cyan-400">{formatCurrency(exp.amount, currency)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit border ${
                        exp.policy_check === 'Compliant'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {exp.policy_check === 'Compliant' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      )}
                      {exp.policy_check}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-semibold text-slate-400">{exp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0B1021] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(0,0,0,0.9)] border border-cyan-500/40 relative text-white">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-display">Submit Corporate Travel Expense</h3>
            <p className="text-xs text-slate-400 mt-1">Instant policy compliance verification against department budgets.</p>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="Meals">Meals &amp; Dining (Per-diem $65/day)</option>
                  <option value="Transport">Ground Transport / Rideshare</option>
                  <option value="Hotel">Hotel Stay &amp; Incidental</option>
                  <option value="Flight">Airfare &amp; Baggage</option>
                  <option value="Conference">Conference &amp; Registration Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  required
                  value={expMerchant}
                  onChange={(e) => setExpMerchant(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. Urban Bistro SF"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Business Purpose</label>
                <input
                  type="text"
                  placeholder="Client dinner with FinTech partner team"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Submit & Check Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

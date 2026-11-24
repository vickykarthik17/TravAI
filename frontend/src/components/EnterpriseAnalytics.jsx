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
        employee_name: user?.full_name || 'Alexander Wright',
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
      <section className="module-header module-header-blue flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Enterprise Intelligence</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-blue-600" /> Operational &amp; Financial BI
            </span>
          </div>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 font-display">
            Enterprise Analytics, Expenses &amp; Proactive Insights
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl">
            Real-time portfolio benchmarking, AI anomaly detection, competitor rate tracking, automated corporate expense capture, and self-service audit report exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExport('rooms')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Rooms CSV</span>
          </button>
          <button
            onClick={() => handleExport('revenue')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Revenue CSV</span>
          </button>
          <button
            onClick={() => handleExport('audit')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Trail CSV</span>
          </button>
        </div>
      </section>

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Operational Dashboard Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-l-4 border-blue-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Room Turnaround Speed</p>
          <p className="text-2xl font-black text-slate-900 font-display mt-1">28 mins</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">7 mins faster than target</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-emerald-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Guest CSAT / NPS Score</p>
          <p className="text-2xl font-black text-emerald-600 font-display mt-1">94.8 / 100</p>
          <p className="text-xs text-slate-500 mt-1">Based on 182 verified stay surveys</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-indigo-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Staff Productivity Index</p>
          <p className="text-2xl font-black text-indigo-600 font-display mt-1">96.2%</p>
          <p className="text-xs text-slate-500 mt-1">100% work orders resolved</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-amber-500">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Expense Policy Compliance</p>
          <p className="text-2xl font-black text-amber-600 font-display mt-1">98.1%</p>
          <p className="text-xs text-slate-500 mt-1">1 exception flagged for review</p>
        </div>
      </div>

      {/* Proactive AI Insights Panel */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900 font-display">Proactive AI Operational Insights</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Real-time Telemetry Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`p-4 rounded-2xl border transition-all ${
                ins.urgency === 'High'
                  ? 'bg-rose-50/50 border-rose-200'
                  : ins.urgency === 'Medium'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-indigo-50/50 border-indigo-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white border">
                  {ins.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ins.urgency === 'High'
                      ? 'bg-rose-200 text-rose-900'
                      : ins.urgency === 'Medium'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-indigo-200 text-indigo-900'
                  }`}
                >
                  {ins.urgency} Priority · {Math.round(ins.confidence * 100)}% Conf.
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900">{ins.headline}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ins.details}</p>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">Action:</span>
                <strong className="text-indigo-700">{ins.suggested_action}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor Rate Parity Table */}
      <div className="glass-card rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-display">Competitor Rate Monitoring &amp; Market Parity</h3>
            <p className="text-xs text-slate-500">Real-time web scraper comparison across local competing luxury hotels.</p>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            Updated Hourly
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <th className="py-3 px-4">Competitor Hotel</th>
                <th className="py-3 px-4">Room Category</th>
                <th className="py-3 px-4">Competitor Rate</th>
                <th className="py-3 px-4">Our Direct Rate</th>
                <th className="py-3 px-4">Parity Variance</th>
                <th className="py-3 px-4 text-right">Yield Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {competitors.map((cp) => {
                const isUnder = cp.parity_difference < 0;

                return (
                  <tr key={cp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{cp.competitor_name}</td>
                    <td className="py-3 px-4 font-medium">{cp.room_type}</td>
                    <td className="py-3 px-4 font-semibold text-slate-600">{formatCurrency(cp.competitor_rate, currency)}</td>
                    <td className="py-3 px-4 font-bold text-indigo-600">{formatCurrency(cp.our_rate, currency)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isUnder ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {formatCurrency(Math.abs(cp.parity_difference), currency)} {isUnder ? 'Lower (Competitive)' : 'Higher'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
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
      <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900 font-display">Corporate Expense Management &amp; Policy Checks</h3>
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Submit Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Policy Check</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{exp.employee_name}</td>
                  <td className="py-3 px-4">{exp.category}</td>
                  <td className="py-3 px-4 font-semibold">{exp.merchant}</td>
                  <td className="py-3 px-4 text-slate-500">{exp.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(exp.amount, currency)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit ${
                        exp.policy_check === 'Compliant'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {exp.policy_check === 'Compliant' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {exp.policy_check}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-semibold text-slate-600">{exp.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <h3 className="text-xl font-bold text-slate-900 font-display">Submit Corporate Travel Expense</h3>
            <p className="text-xs text-slate-500 mt-1">Instant policy compliance verification against department budgets.</p>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="Meals">Meals &amp; Dining (Per-diem $65/day)</option>
                  <option value="Transport">Ground Transport / Rideshare</option>
                  <option value="Hotel">Hotel Stay &amp; Incidental</option>
                  <option value="Flight">Airfare &amp; Baggage</option>
                  <option value="Conference">Conference &amp; Registration Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Merchant / Vendor</label>
                <input
                  type="text"
                  required
                  value={expMerchant}
                  onChange={(e) => setExpMerchant(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Business Purpose</label>
                <input
                  type="text"
                  placeholder="Client dinner with FinTech partner team"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary py-2 text-xs font-bold"
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

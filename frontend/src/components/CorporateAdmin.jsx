import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  User, 
  Building2,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const CorporateAdmin = ({ requests, onRequestsUpdated, currency = 'USD' }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approved' | 'Rejected'
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actor, setActor] = useState('Corporate Approver (VP Travel)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenActionModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setReviewerNotes(
      type === 'Approved' 
        ? 'Approved under Q3 corporate sales travel budget policy.' 
        : 'Exceeds nightly per-diem cap for standard tier travel.'
    );
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedReq || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'Approved') {
        await api.approveCorporateRequest(selectedReq.id, reviewerNotes, actor);
      } else {
        await api.rejectCorporateRequest(selectedReq.id, reviewerNotes, actor);
      }
      onRequestsUpdated();
      setSelectedReq(null);
      alert(`Request has been successfully ${actionType.toLowerCase()}! Recorded in system audit log.`);
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err);
      alert('Action failed. Please verify the backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & Policy Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-display">Enterprise Corporate Travel Admin</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              Automated Policy Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review corporate travel booking requests, enforce per-diem spend limits, and resolve policy exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]">
            Pending: <span className="font-bold text-white">{requests.filter(r => r.status === 'Pending').length}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            Approved: <span className="font-bold text-white">{requests.filter(r => r.status === 'Approved').length}</span>
          </div>
        </div>
      </div>

      {/* Corporate Requests List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-3xl bg-slate-900/80 border-l-4 border-l-purple-500 border border-slate-800 shadow-xl backdrop-blur-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
          >
            {/* Left Info Column */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  {req.employee_name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-950 text-purple-300 border border-purple-800/50">
                  {req.department}
                </span>

                {req.policy_compliant ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Policy Compliant
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Policy Warning
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Destination: <strong className="text-slate-200">{req.destination}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Dates: <strong className="text-slate-200">{req.travel_dates}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Est. Budget: <strong className="text-emerald-400">{formatCurrency(req.estimated_budget, currency)}</strong>
                </span>
              </div>

              {req.policy_violations && (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Policy Alert: </span>
                    {req.policy_violations}
                  </div>
                </div>
              )}

              {req.reviewer_notes && (
                <div className="text-xs text-slate-300 italic bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <span className="font-semibold text-purple-400 not-italic">Reviewer Notes: </span>
                  "{req.reviewer_notes}"
                </div>
              )}
            </div>

            {/* Right Action Column */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              {req.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => handleOpenActionModal(req, 'Approved')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(req, 'Rejected')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              ) : (
                <span className={`px-3 py-1.5 rounded-full font-bold text-xs border flex items-center gap-1.5 ${
                  req.status === 'Approved'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                }`}>
                  {req.status === 'Approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                  Request {req.status}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Action Approval/Rejection Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleConfirmAction} className="bg-[#0B1021] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative text-white">
            <button
              type="button"
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white font-display">
                {actionType === 'Approved' ? 'Approve Corporate Request' : 'Reject Corporate Request'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Employee: {selectedReq.employee_name} ({selectedReq.department})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reviewer Notes &amp; Decision Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reviewer Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/30 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                  actionType === 'Approved' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]' 
                    : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                }`}
              >
                {isSubmitting ? 'Processing...' : `Confirm ${actionType}`}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};

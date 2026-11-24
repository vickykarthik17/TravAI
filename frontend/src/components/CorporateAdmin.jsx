import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';

export const CorporateAdmin = ({ requests, onRequestUpdated, currency = 'USD' }) => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('Approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [actor, setActor] = useState('Corporate Travel Director');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenActionModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setReviewerNotes(
      type === 'Approved'
        ? 'Verified corporate policy exceptions and pre-cleared department budget allocation.'
        : 'Request exceeds Q3 division cap; please re-submit with preferred partner hotel.'
    );
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setIsSubmitting(true);
    try {
      await api.approveCorporateRequest(
        selectedReq.id,
        actionType,
        reviewerNotes,
        actor
      );
      onRequestUpdated();
      setSelectedReq(null);
      alert(`Travel Request successfully ${actionType}!`);
    } catch (err) {
      console.error('Failed to update corporate request:', err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : err.response
          ? `Request failed with status ${err.response.status}.`
          : 'Cannot reach the backend server.';
      alert(`Failed to update request: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & Policy Banner */}
      <div className="module-header-purple flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-display">Enterprise Corporate Travel Admin</h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/20 text-purple-700 border border-purple-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-600" />
              Automated Policy Engine Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review corporate travel booking requests, enforce per-diem spend limits, and resolve policy exceptions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-purple-100 border border-purple-200 text-purple-800">
            Pending: <span className="font-bold text-purple-700">{requests.filter(r => r.status === 'Pending').length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800">
            Approved: <span className="font-bold text-emerald-700">{requests.filter(r => r.status === 'Approved').length}</span>
          </div>
        </div>
      </div>

      {/* Corporate Requests List */}
      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="glass-card p-5 rounded-2xl border-l-4 border-l-purple-400 border border-purple-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            {/* Left Info Column */}
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  {req.employee_name}
                </h3>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-white text-slate-400 border border-slate-200">
                  {req.department}
                </span>

                {req.policy_compliant ? (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Policy Compliant
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Policy Warning
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Destination: <strong className="text-slate-700">{req.destination}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Dates: <strong className="text-slate-700">{req.travel_dates}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Est. Budget: <strong className="text-emerald-600">{formatCurrency(req.estimated_budget, currency)}</strong>
                </span>
              </div>

              {req.policy_violations && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Policy Alert: </span>
                    {req.policy_violations}
                  </div>
                </div>
              )}

              {req.reviewer_notes && (
                <div className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-600 not-italic">Reviewer Notes: </span>
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
                    className="btn-success text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleOpenActionModal(req, 'Rejected')}
                    className="btn-danger text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              ) : (
                <span className={`px-3 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 ${
                  req.status === 'Approved'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                }`}>
                  {req.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  Request {req.status}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Action Approval/Rejection Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <form onSubmit={handleConfirmAction} className="bg-white border border-purple-100 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-purple-500/10 relative">
            <button
              type="button"
              onClick={() => setSelectedReq(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900 font-display">
                {actionType === 'Approved' ? 'Approve Corporate Request' : 'Reject Corporate Request'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Employee: {selectedReq.employee_name} ({selectedReq.department})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reviewer Notes & Decision Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Reviewer Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={actor}
                  onChange={(e) => setActor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`text-xs disabled:opacity-50 ${actionType === 'Approved' ? 'btn-success' : 'btn-danger'}`}
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

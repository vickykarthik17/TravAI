import React from 'react';
import { ShieldCheck, Clock, User } from 'lucide-react';

export const AuditTrailLog = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="module-header-emerald flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-display">System Audit Trail & AI Governance Log</h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              SOC2 & ISO Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, timestamped audit ledger tracking room status changes, human rate overrides, and corporate approvals.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-emerald-100 border border-emerald-200 text-xs text-emerald-800">
          Total Recorded Actions: <span className="font-bold text-emerald-700">{logs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="table-head-emerald uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 font-semibold">Timestamp (UTC)</th>
                <th className="py-3.5 px-4 font-semibold">Actor / System</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                <th className="py-3.5 px-4 font-semibold">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {logs.map((log) => {
                const formattedDate = new Date(log.timestamp).toLocaleString();

                let actionBadgeColor = 'bg-blue-500/10 text-blue-600 border-blue-500/30';
                if (log.action.includes('OVERRIDE')) actionBadgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
                if (log.action.includes('APPROVED')) actionBadgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
                if (log.action.includes('REJECTED')) actionBadgeColor = 'bg-rose-500/10 text-rose-600 border-rose-500/30';

                return (
                  <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors even:bg-slate-50/50">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {formattedDate}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 font-semibold text-cyan-700">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.actor}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {log.target_type}: <strong className="text-slate-900">{log.target_id}</strong>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {log.details}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import { ShieldCheck, Clock, User } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../utils/date';

export const AuditTrailLog = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-display">System Audit Trail &amp; AI Governance Log</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Resort Operations &amp; Compliance Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable, timestamped audit ledger tracking room status changes, human rate overrides, and corporate approvals.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          Total Recorded Actions: <span className="font-bold text-cyan-400">{logs.length}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-cyan-400 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-4 px-4 font-bold">Timestamp (UTC)</th>
                <th className="py-4 px-4 font-semibold text-slate-300">Actor / System</th>
                <th className="py-4 px-4 font-semibold text-slate-300">Action</th>
                <th className="py-4 px-4 font-semibold text-slate-300">Target Entity</th>
                <th className="py-4 px-4 font-semibold text-slate-300">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {logs.map((log) => {
                const formattedDate = formatDateTime(log.timestamp);
                const relativeTime = formatRelativeTime(log.timestamp);

                let actionBadgeColor = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
                if (log.action.includes('OVERRIDE')) actionBadgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                if (log.action.includes('APPROVED')) actionBadgeColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                if (log.action.includes('REJECTED')) actionBadgeColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30';

                return (
                  <tr key={log.id} className="hover:bg-cyan-950/20 transition-colors even:bg-slate-900/40">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-white">{formattedDate}</span>
                        <span className="text-[10px] text-slate-400">({relativeTime})</span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4 font-semibold text-cyan-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.actor}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${actionBadgeColor}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {log.target_type}: <strong className="text-white">{log.target_id}</strong>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-4 text-slate-400">
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

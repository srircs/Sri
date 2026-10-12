import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  Filter, 
  Clock, 
  FileText, 
  UserCheck, 
  PhoneCall, 
  Trash2,
  Calendar
} from 'lucide-react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../services/auditService';
import { EmptyState } from '../common/EmptyState';

export const AuditHistoryView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    setIsLoading(true);
    getAuditLogs(150)
      .then(setLogs)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !s ||
      log.actorName.toLowerCase().includes(s) ||
      log.action.toLowerCase().includes(s) ||
      log.targetSummary.toLowerCase().includes(s) ||
      (log.details && log.details.toLowerCase().includes(s));

    if (!matchSearch) return false;

    if (actionFilter !== 'ALL' && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              System Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable cryptographic records of all administrative actions, staff calls, status changes, and deletions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
            {logs.length} audit entries recorded
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by actor, action, company name, or details..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Action Categories</option>
            <option value="Lead Created">Lead Created</option>
            <option value="Lead Updated">Lead Updated</option>
            <option value="Lead Deleted">Lead Deleted</option>
            <option value="Call Activity">Call Activity</option>
            <option value="Follow-up">Follow-ups</option>
            <option value="Staff">Staff Management</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Records Found"
          description={searchTerm ? "No audit logs match your search filter." : "Audit log will record system operations automatically."}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Record</th>
                  <th className="py-3 px-4">Details / Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map(log => {
                  const isDelete = log.action.includes('Deleted');
                  const isCall = log.action.includes('Call');
                  const isStaff = log.action.includes('Staff');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{log.actorName}</span>
                        <span className={`text-[10px] ml-1.5 px-1.5 py-0.2 rounded font-bold uppercase ${
                          log.actorRole === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          isDelete 
                            ? 'bg-rose-100 text-rose-800' 
                            : isCall 
                            ? 'bg-cyan-100 text-cyan-800' 
                            : isStaff 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {log.targetSummary}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

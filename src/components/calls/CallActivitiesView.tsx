import React, { useState } from 'react';
import { 
  PhoneCall, 
  Search, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  Clock,
  Filter
} from 'lucide-react';
import { CallActivity, UserProfile } from '../../types';
import { EmptyState } from '../common/EmptyState';

interface CallActivitiesViewProps {
  calls: CallActivity[];
  staffList?: UserProfile[];
  isAdmin: boolean;
}

export const CallActivitiesView: React.FC<CallActivitiesViewProps> = ({
  calls,
  staffList = [],
  isAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('ALL');

  const filteredCalls = calls.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !s ||
      (c.companyName && c.companyName.toLowerCase().includes(s)) ||
      (c.contactPerson && c.contactPerson.toLowerCase().includes(s)) ||
      (c.mobileNumber && c.mobileNumber.includes(s)) ||
      c.callOutcome.toLowerCase().includes(s) ||
      c.discussionSummary.toLowerCase().includes(s);

    if (!matchSearch) return false;

    if (isAdmin && selectedStaff !== 'ALL' && c.staffId !== selectedStaff) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isAdmin ? 'Company Call Activities' : 'My Call History'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin 
              ? 'Complete company-wide sales phone call activity and negotiation outcomes' 
              : 'Permanent log of all telephone interactions you have recorded'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-bold">
            Total {filteredCalls.length} calls
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
            placeholder="Search calls by company, outcome, discussion notes..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium outline-none w-full sm:w-auto"
            >
              <option value="ALL">All Staff Personnel</option>
              {staffList.map(s => (
                <option key={s.uid} value={s.uid}>{s.displayName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Calls Stream */}
      {filteredCalls.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title="No Calls Found"
          description={searchTerm ? "No calls match your search query." : "No calls have been recorded yet."}
        />
      ) : (
        <div className="space-y-3">
          {filteredCalls.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all text-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{c.companyName}</span>
                  {c.leadCode && (
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                      {c.leadCode}
                    </span>
                  )}
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {c.callOutcome}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-200">
                    Interest: {c.interestLevel || 'Medium'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>{new Date(c.callDateTime).toLocaleString()}</span>
                  <span>•</span>
                  <span>by <strong className="text-slate-800">{c.staffName}</strong></span>
                </div>
              </div>

              <div className="text-slate-700 leading-relaxed font-medium bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                {c.discussionSummary}
              </div>

              {c.customerResponse && (
                <div className="text-slate-600 italic">
                  Customer Quote / Feedback: "{c.customerResponse}"
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span>
                  Status change: <strong className="text-slate-800">{c.previousStatus || '—'} → {c.updatedStatus}</strong>
                </span>
                {c.nextFollowUpDate && (
                  <span>
                    Next Scheduled: <strong className="text-indigo-600">{new Date(c.nextFollowUpDate).toLocaleString()}</strong>
                  </span>
                )}
                {c.nextAction && (
                  <span>Next Action: <strong className="text-slate-800">{c.nextAction}</strong></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

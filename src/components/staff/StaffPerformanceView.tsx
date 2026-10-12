import React from 'react';
import { 
  TrendingUp, 
  Award, 
  PhoneCall, 
  CalendarClock, 
  CheckCircle2, 
  ClockAlert, 
  Users, 
  Flame 
} from 'lucide-react';
import { Lead, CallActivity, FollowUp, UserProfile } from '../../types';

interface StaffPerformanceViewProps {
  myLeads: Lead[];
  myCalls: CallActivity[];
  myFollowUps: FollowUp[];
  currentUser: UserProfile;
}

export const StaffPerformanceView: React.FC<StaffPerformanceViewProps> = ({
  myLeads,
  myCalls,
  myFollowUps,
  currentUser,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const assignedCount = myLeads.length;
  const callsToday = myCalls.filter(c => (c.callDateTime || c.createdAt).startsWith(todayStr)).length;
  const totalCalls = myCalls.length;
  
  const convertedLeads = myLeads.filter(l => l.status === 'Converted');
  const interestedLeads = myLeads.filter(l => l.status === 'Interested');
  const winRate = assignedCount > 0 ? Math.round((convertedLeads.length / assignedCount) * 100) : 0;

  const completedFups = myFollowUps.filter(f => f.status === 'completed').length;
  const overdueFups = myFollowUps.filter(f => f.status === 'pending' && f.dueDate < todayStr).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Personal Metrics & Goals
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            My Sales Performance Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual sales conversions, call activity history, and lead follow-up reliability
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="font-bold text-sm text-slate-900">{currentUser.displayName}</div>
          <div className="text-xs text-slate-400 font-mono">@{currentUser.username}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Pipeline Size</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{assignedCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Leads assigned to me</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Calls Today</span>
            <PhoneCall className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-blue-600">{callsToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total {totalCalls} all-time</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-4 rounded-xl text-white shadow-md shadow-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-[11px] font-bold uppercase">Win Rate</span>
            <Award className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="text-2xl font-black">{winRate}%</div>
          <div className="text-[11px] text-emerald-100 mt-1">{convertedLeads.length} leads converted</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase">Follow-up Quality</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedFups}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {overdueFups > 0 ? (
              <span className="text-rose-600 font-bold">{overdueFups} overdue</span>
            ) : (
              <span className="text-emerald-600">0 overdue</span>
            )}
          </div>
        </div>
      </div>

      {/* Won Converted Leads List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-4 h-4 text-emerald-600" />
          My Converted Leads ({convertedLeads.length})
        </h2>

        {convertedLeads.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No leads marked as Converted yet. Keep following up with Interested prospects!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {convertedLeads.map(l => (
              <div key={l.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{l.companyName}</span>
                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                    {l.leadId}
                  </span>
                </div>
                <div className="text-slate-600">{l.contactPerson} • {l.mobileNumber}</div>
                {l.requirement && (
                  <div className="text-[11px] text-slate-500 italic">Won on: {l.requirement}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

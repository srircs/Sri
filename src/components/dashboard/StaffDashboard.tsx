import React, { useMemo } from 'react';
import { 
  Users, 
  PhoneCall, 
  CalendarClock, 
  ClockAlert, 
  Award, 
  CheckCircle2, 
  ArrowUpRight, 
  Phone, 
  Flame, 
  Clock
} from 'lucide-react';
import { Lead, CallActivity, FollowUp, UserProfile } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { LeadCard } from '../leads/LeadCard';

interface StaffDashboardProps {
  myLeads: Lead[];
  myCalls: CallActivity[];
  myFollowUps: FollowUp[];
  currentUser: UserProfile;
  onOpenLeadDetail: (lead: Lead) => void;
  onUpdateCall: (lead: Lead) => void;
  onNavigate: (view: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  myLeads,
  myCalls,
  myFollowUps,
  currentUser,
  onOpenLeadDetail,
  onUpdateCall,
  onNavigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Strictly calculated for logged-in staff member
  const myTotalLeads = myLeads.length;
  const myNewLeads = myLeads.filter(l => l.status === 'New Lead').length;
  const myCallsToday = myCalls.filter(c => (c.callDateTime || c.createdAt).startsWith(todayStr)).length;
  
  const myFollowupsToday = myFollowUps.filter(f => f.status === 'pending' && f.dueDate === todayStr).length;
  const myOverdueFollowups = myFollowUps.filter(f => f.status === 'pending' && f.dueDate < todayStr).length;
  
  const myInterestedLeads = myLeads.filter(l => l.status === 'Interested').length;
  const myConvertedLeads = myLeads.filter(l => l.status === 'Converted').length;
  const myPendingLeads = myLeads.filter(l => l.status !== 'Converted' && l.status !== 'Lost Lead' && l.status !== 'Not Interested').length;

  const urgentFollowups = useMemo(() => {
    return myFollowUps
      .filter(f => f.status === 'pending' && (f.dueDate <= todayStr))
      .slice(0, 5);
  }, [myFollowUps, todayStr]);

  const recentCalls = useMemo(() => {
    return [...myCalls].slice(0, 5);
  }, [myCalls]);

  return (
    <div className="space-y-6">
      {/* Welcome Greeting */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
            Staff Sales Workspace
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            Welcome back, {currentUser.displayName}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            You have <strong className="text-blue-300">{myFollowupsToday}</strong> follow-ups due today and <strong className={myOverdueFollowups > 0 ? "text-rose-400 font-bold" : "text-slate-300"}>{myOverdueFollowups}</strong> overdue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('today-followups')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Start Calling Today
          </button>
        </div>
      </div>

      {/* Staff KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: My Assigned Leads */}
        <div
          onClick={() => onNavigate('my-leads')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">My Assigned Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myTotalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-blue-600 font-bold">{myNewLeads}</span> new leads
          </div>
        </div>

        {/* Card 2: My Calls Today */}
        <div
          onClick={() => onNavigate('my-call-history')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Calls Today</span>
            <PhoneCall className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myCallsToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total {myCalls.length} calls logged
          </div>
        </div>

        {/* Card 3: Follow-ups Today & Overdue */}
        <div
          onClick={() => onNavigate('today-followups')}
          className={`p-4 rounded-xl border shadow-xs cursor-pointer transition-all ${
            myOverdueFollowups > 0 ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Follow-ups</span>
            <CalendarClock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{myFollowupsToday}</span>
            <span className="text-xs text-slate-500">today</span>
            {myOverdueFollowups > 0 && (
              <span className="text-xs font-bold text-rose-600">({myOverdueFollowups} overdue)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myOverdueFollowups > 0 ? 'Urgent attention required' : 'On schedule'}
          </div>
        </div>

        {/* Card 4: Converted Won */}
        <div
          onClick={() => onNavigate('my-leads')}
          className="bg-emerald-500 text-white p-4 rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Converted Won</span>
            <Award className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="text-2xl font-black">{myConvertedLeads}</div>
          <div className="text-[11px] text-emerald-100 mt-1">
            {myInterestedLeads} leads in Interested stage
          </div>
        </div>
      </div>

      {/* Action Sections: Urgent Follow-ups & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Urgent Follow-ups Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">Today & Overdue Follow-ups</h2>
            </div>
            <button
              onClick={() => onNavigate('today-followups')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentFollowups.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No pending follow-ups due today. You are all caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {urgentFollowups.map(fup => {
                const parent = myLeads.find(l => l.id === fup.leadDocId);
                const isOverdue = fup.dueDate < todayStr;
                return (
                  <div
                    key={fup.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isOverdue ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{fup.companyName}</span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600">
                        {fup.contactPerson} • {fup.mobileNumber}
                      </div>
                      {fup.notes && (
                        <div className="text-[11px] text-slate-500 italic">
                          Note: {fup.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${fup.mobileNumber}`}
                        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"
                        title="Call"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                      {parent && (
                        <button
                          onClick={() => onUpdateCall(parent)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                        >
                          Update Call
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: My Recent Call Updates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">My Recent Call Activity</h2>
            </div>
            <button
              onClick={() => onNavigate('my-call-history')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>View History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentCalls.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No calls logged yet. Click "Update Call" on any lead to log conversation notes.
            </div>
          ) : (
            <div className="space-y-3">
              {recentCalls.map(c => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.companyName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.callDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-blue-600 font-semibold">{c.callOutcome}</div>
                  <p className="text-slate-700 line-clamp-1 italic bg-white p-1.5 rounded border border-slate-150">
                    "{c.discussionSummary}"
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Updated status: <strong className="text-slate-800">{c.updatedStatus}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

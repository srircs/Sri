import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  PhoneCall, 
  CalendarClock, 
  ClockAlert, 
  TrendingUp, 
  Award, 
  XCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Download, 
  Calendar,
  Building2,
  Phone
} from 'lucide-react';
import { Lead, CallActivity, FollowUp, UserProfile } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DEFAULT_LEAD_STATUSES } from '../../utils/constants';

interface AdminDashboardProps {
  leads: Lead[];
  calls: CallActivity[];
  followUps: FollowUp[];
  staffList: UserProfile[];
  onOpenLeadDetail: (lead: Lead) => void;
  onNavigate: (view: string) => void;
  onOpenAddLeadModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  leads,
  calls,
  followUps,
  staffList,
  onOpenLeadDetail,
  onNavigate,
  onOpenAddLeadModal,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'this_week' | 'this_month' | 'all'>('this_month');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date filter
  const isWithinDateRange = (dateStr: string) => {
    if (dateFilter === 'all') return true;
    const d = new Date(dateStr);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return dateStr.startsWith(todayStr);
    }
    if (dateFilter === 'this_week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }
    if (dateFilter === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => isWithinDateRange(l.createdAt));
  }, [leads, dateFilter]);

  const filteredCalls = useMemo(() => {
    return calls.filter(c => isWithinDateRange(c.callDateTime || c.createdAt));
  }, [calls, dateFilter]);

  // KPI Calculations
  const totalLeads = leads.length;
  const newLeadsToday = leads.filter(l => l.createdAt.startsWith(todayStr)).length;
  const leadsAssigned = leads.filter(l => l.assignedStaffId).length;
  const leadsContacted = leads.filter(l => l.lastContactDate || l.status !== 'New Lead' && l.status !== 'Not Contacted').length;
  
  const followupsDueToday = followUps.filter(f => f.status === 'pending' && f.dueDate === todayStr).length;
  const overdueFollowups = followUps.filter(f => f.status === 'pending' && f.dueDate < todayStr).length;
  
  const interestedLeads = leads.filter(l => l.status === 'Interested').length;
  const convertedLeads = leads.filter(l => l.status === 'Converted').length;
  const lostLeads = leads.filter(l => l.status === 'Lost Lead' || l.status === 'Not Interested').length;

  const resolvedTotal = convertedLeads + lostLeads;
  const conversionRate = resolvedTotal > 0 ? Math.round((convertedLeads / resolvedTotal) * 100) : (totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0);

  // Status Distribution
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    DEFAULT_LEAD_STATUSES.forEach(st => { map[st.name] = 0; });
    leads.forEach(l => {
      map[l.status] = (map[l.status] || 0) + 1;
    });
    return map;
  }, [leads]);

  // Staff Performance Breakdown
  const staffPerformance = useMemo(() => {
    return staffList.map(staff => {
      const assigned = leads.filter(l => l.assignedStaffId === staff.uid);
      const staffCallsTotal = calls.filter(c => c.staffId === staff.uid);
      const staffCallsToday = staffCallsTotal.filter(c => (c.callDateTime || c.createdAt).startsWith(todayStr));
      const won = assigned.filter(l => l.status === 'Converted').length;
      const staffFups = followUps.filter(f => f.assignedStaffId === staff.uid && f.status === 'pending');
      const staffOverdue = staffFups.filter(f => f.dueDate < todayStr).length;
      const wonRate = assigned.length > 0 ? Math.round((won / assigned.length) * 100) : 0;

      return {
        staff,
        assignedCount: assigned.length,
        callsToday: staffCallsToday.length,
        callsTotal: staffCallsTotal.length,
        wonCount: won,
        pendingFollowups: staffFups.length,
        overdueFollowups: staffOverdue,
        wonRate,
      };
    });
  }, [staffList, leads, calls, followUps, todayStr]);

  const recentCalls = useMemo(() => {
    return [...calls].slice(0, 6);
  }, [calls]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Date Filter & Add Lead CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sri Groups Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Enterprise sales pipeline health, staff conversion velocity, and follow-up metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Date range filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'today' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('this_week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'this_week' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Week
            </button>
            <button
              onClick={() => setDateFilter('this_month')}
              className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'this_month' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Month
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'all' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
          </div>

          <button
            onClick={onOpenAddLeadModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Total Leads */}
        <div 
          onClick={() => onNavigate('all-leads')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-blue-600 font-bold">+{newLeadsToday}</span> today
          </div>
        </div>

        {/* Card 2: Contacted */}
        <div 
          onClick={() => onNavigate('call-activities')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Contacted</span>
            <PhoneCall className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{leadsContacted}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {leadsAssigned} leads assigned
          </div>
        </div>

        {/* Card 3: Follow-ups Due Today */}
        <div 
          onClick={() => onNavigate('follow-ups')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Today</span>
            <CalendarClock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{followupsDueToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">Scheduled calls today</div>
        </div>

        {/* Card 4: Overdue Follow-ups (Alert) */}
        <div 
          onClick={() => onNavigate('follow-ups')}
          className={`p-4 rounded-xl border shadow-xs transition-all cursor-pointer ${
            overdueFollowups > 0 
              ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Overdue Follow-ups</span>
            <ClockAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{overdueFollowups}</div>
          <div className="text-[11px] text-rose-700 mt-1 font-medium">Needs urgent action</div>
        </div>

        {/* Card 5: Conversion Rate & Wins */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-gradient-to-br from-emerald-500 to-teal-700 p-4 rounded-xl text-white shadow-md shadow-emerald-600/20 col-span-2 sm:col-span-1 cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion Rate</span>
            <Award className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="text-2xl font-black">{conversionRate}%</div>
          <div className="text-[11px] text-emerald-100 mt-1">
            <strong>{convertedLeads}</strong> Converted • {interestedLeads} Interested
          </div>
        </div>
      </div>

      {/* Main Grid: Staff Performance & Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Staff-wise Performance Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-slate-900">Staff Sales Activity & Conversion Summary</h2>
            </div>
            <button
              onClick={() => onNavigate('staff-management')}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>Manage Staff</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3 text-center">Assigned</th>
                  <th className="py-3 px-3 text-center">Calls Today</th>
                  <th className="py-3 px-3 text-center">Total Calls</th>
                  <th className="py-3 px-3 text-center">Pending Follow-ups</th>
                  <th className="py-3 px-3 text-center text-rose-600">Overdue</th>
                  <th className="py-3 px-4 text-right">Converted (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {staffPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No staff accounts configured. Add staff to assign leads.
                    </td>
                  </tr>
                ) : (
                  staffPerformance.map(({ staff, assignedCount, callsToday, callsTotal, pendingFollowups, overdueFollowups, wonCount, wonRate }) => (
                    <tr key={staff.uid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{staff.displayName}</span>
                          {!staff.isActive && (
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                              Inactive
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">@{staff.username}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">
                        {assignedCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-blue-600">
                        {callsToday}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {callsTotal}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {pendingFollowups}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {overdueFollowups > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            {overdueFollowups}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-emerald-600">{wonCount}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({wonRate}%)</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Lead Status Distribution Pipeline (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900">Lead Status Pipeline</h2>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Configure
            </button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {DEFAULT_LEAD_STATUSES.map(st => {
              const count = statusCounts[st.name] || 0;
              const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;

              return (
                <div key={st.id} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={st.name} size="sm" />
                    <span className="font-bold text-slate-900">
                      {count} <span className="font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Call Updates Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-slate-900">Recent Call Updates</h2>
          </div>
          <button
            onClick={() => onNavigate('call-activities')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <span>View All Activity</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentCalls.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No calls have been logged yet. Calls recorded by sales staff will appear here instantly.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCalls.map(call => (
              <div
                key={call.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{call.companyName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(call.callDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="font-semibold text-blue-600">{call.callOutcome}</span>
                  <span>•</span>
                  <span>by <strong>{call.staffName}</strong></span>
                </div>
                <p className="text-slate-700 line-clamp-2 italic bg-white p-2 rounded border border-slate-150">
                  "{call.discussionSummary}"
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Status: <strong className="text-slate-800">{call.updatedStatus}</strong></span>
                  {call.nextFollowUpDate && (
                    <span className="text-indigo-600 font-semibold">
                      Follow-up: {new Date(call.nextFollowUpDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

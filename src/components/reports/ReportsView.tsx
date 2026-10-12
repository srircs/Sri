import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar, 
  Users, 
  PhoneCall, 
  Award, 
  PieChart,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { Lead, CallActivity, FollowUp, UserProfile } from '../../types';
import { LEAD_SOURCES, DEFAULT_LEAD_STATUSES } from '../../utils/constants';

interface ReportsViewProps {
  leads: Lead[];
  calls: CallActivity[];
  followUps: FollowUp[];
  staffList: UserProfile[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  leads,
  calls,
  followUps,
  staffList,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_month' | 'last_7_days'>('all');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Filter logic
  const isDateMatched = (dateStr: string) => {
    if (dateRange === 'all') return true;
    const d = new Date(dateStr);
    if (dateRange === 'last_7_days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= sevenDaysAgo;
    }
    if (dateRange === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'last_month') {
      const prevMonth = (now.getMonth() + 11) % 12;
      const prevYear = prevMonth === 11 ? now.getFullYear() - 1 : now.getFullYear();
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }
    return true;
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const staffMatch = selectedStaff === 'ALL' || l.assignedStaffId === selectedStaff;
      const dateMatch = isDateMatched(l.createdAt);
      return staffMatch && dateMatch;
    });
  }, [leads, selectedStaff, dateRange]);

  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const staffMatch = selectedStaff === 'ALL' || c.staffId === selectedStaff;
      const dateMatch = isDateMatched(c.callDateTime || c.createdAt);
      return staffMatch && dateMatch;
    });
  }, [calls, selectedStaff, dateRange]);

  const filteredFollowUps = useMemo(() => {
    return followUps.filter(f => {
      const staffMatch = selectedStaff === 'ALL' || f.assignedStaffId === selectedStaff;
      const dateMatch = isDateMatched(f.dueDate);
      return staffMatch && dateMatch;
    });
  }, [followUps, selectedStaff, dateRange]);

  // Source Performance Analysis
  const sourceStats = useMemo(() => {
    return LEAD_SOURCES.map(source => {
      const srcLeads = filteredLeads.filter(l => l.leadSource === source);
      const won = srcLeads.filter(l => l.status === 'Converted').length;
      const lost = srcLeads.filter(l => l.status === 'Lost Lead' || l.status === 'Not Interested').length;
      const winRate = srcLeads.length > 0 ? Math.round((won / srcLeads.length) * 100) : 0;
      return {
        source,
        total: srcLeads.length,
        won,
        lost,
        winRate,
      };
    });
  }, [filteredLeads]);

  // Staff Call Activity Analysis
  const staffCallStats = useMemo(() => {
    return staffList.map(staff => {
      const sCalls = filteredCalls.filter(c => c.staffId === staff.uid);
      const sLeads = filteredLeads.filter(l => l.assignedStaffId === staff.uid);
      const won = sLeads.filter(l => l.status === 'Converted').length;
      const interested = sLeads.filter(l => l.status === 'Interested').length;
      const winRate = sLeads.length > 0 ? Math.round((won / sLeads.length) * 100) : 0;

      return {
        staff,
        callCount: sCalls.length,
        leadCount: sLeads.length,
        won,
        interested,
        winRate,
      };
    });
  }, [staffList, filteredCalls, filteredLeads]);

  // Follow-up Completion vs Missed
  const completedFups = filteredFollowUps.filter(f => f.status === 'completed').length;
  const overdueFups = filteredFollowUps.filter(f => f.status === 'pending' && f.dueDate < todayStr).length;
  const pendingFups = filteredFollowUps.filter(f => f.status === 'pending' && f.dueDate >= todayStr).length;

  // Export Full Report CSV
  const handleExportReportCSV = () => {
    const headers = ['Metric Section', 'Item Name', 'Count / Value', 'Win / Conversion %'];
    const rows: string[][] = [];

    // Lead Sources
    sourceStats.forEach(s => {
      rows.push(['Lead Source Performance', `"${s.source}"`, String(s.total), `${s.winRate}% (Won: ${s.won})`]);
    });

    // Staff Summary
    staffCallStats.forEach(sc => {
      rows.push(['Staff Sales Activity', `"${sc.staff.displayName}"`, `Calls: ${sc.callCount}, Leads: ${sc.leadCount}`, `${sc.winRate}% (Won: ${sc.won})`]);
    });

    // Follow-ups
    rows.push(['Follow-up Status', 'Completed Follow-ups', String(completedFups), '-']);
    rows.push(['Follow-up Status', 'Overdue Follow-ups', String(overdueFups), '-']);
    rows.push(['Follow-up Status', 'Scheduled Upcoming', String(pendingFups), '-']);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sri_Groups_Analytics_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Filters & Export Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sales & Pipeline Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time calculations for conversion velocity, marketing channel efficiency, and team quotas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All-time Records</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="this_month">This Current Month</option>
            <option value="last_month">Last Month</option>
          </select>

          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="ALL">All Staff Personnel</option>
            {staffList.map(s => (
              <option key={s.uid} value={s.uid}>{s.displayName}</option>
            ))}
          </select>

          <button
            onClick={handleExportReportCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Conversion Velocity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Filtered Leads</div>
          <div className="text-2xl font-black text-slate-900">{filteredLeads.length}</div>
          <div className="text-xs text-slate-400 mt-1">Active in current filter window</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Calls Executed</div>
          <div className="text-2xl font-black text-blue-600">{filteredCalls.length}</div>
          <div className="text-xs text-slate-400 mt-1">Logged sales phone calls</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-bold uppercase mb-1">Follow-up Completion</div>
          <div className="text-2xl font-black text-emerald-600">
            {completedFups} <span className="text-sm font-semibold text-slate-400">/ {filteredFollowUps.length}</span>
          </div>
          <div className="text-xs text-rose-600 mt-1 font-semibold">{overdueFups} overdue tasks</div>
        </div>
      </div>

      {/* Lead Source Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">Lead Source Conversion Performance</h2>
          </div>
          <span className="text-xs text-slate-400">Identifies highest ROI prospect channels</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Lead Source</th>
                <th className="py-2.5 px-3 text-center">Total Received</th>
                <th className="py-2.5 px-3 text-center text-emerald-700">Converted (Won)</th>
                <th className="py-2.5 px-3 text-center text-rose-700">Lost / Closed</th>
                <th className="py-2.5 px-3 text-right">Conversion Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceStats.map(s => (
                <tr key={s.source} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{s.source}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{s.total}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{s.won}</td>
                  <td className="py-2.5 px-3 text-center text-slate-500">{s.lost}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-extrabold text-blue-600">{s.winRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Call and Conversion Analysis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">Staff Sales Call Breakdown & Quota Report</h2>
          </div>
          <span className="text-xs text-slate-400">Team call volume vs deals won</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Sales Executive</th>
                <th className="py-2.5 px-3 text-center">Assigned Pipeline</th>
                <th className="py-2.5 px-3 text-center text-blue-600">Calls Logged</th>
                <th className="py-2.5 px-3 text-center text-indigo-600">Interested Leads</th>
                <th className="py-2.5 px-3 text-center text-emerald-600">Converted Wins</th>
                <th className="py-2.5 px-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffCallStats.map(st => (
                <tr key={st.staff.uid} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900">{st.staff.displayName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">@{st.staff.username}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{st.leadCount}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-600">{st.callCount}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-indigo-600">{st.interested}</td>
                  <td className="py-2.5 px-3 text-center font-extrabold text-emerald-600">{st.won}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{st.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

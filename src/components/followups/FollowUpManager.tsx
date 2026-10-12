import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  ClockAlert, 
  CalendarCheck, 
  Calendar, 
  CheckCircle2, 
  Phone, 
  PhoneCall, 
  AlertTriangle,
  RotateCcw,
  Search,
  User
} from 'lucide-react';
import { FollowUp, Lead, UserProfile } from '../../types';
import { markFollowUpCompleted, rescheduleFollowUp } from '../../services/followUpService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { EmptyState } from '../common/EmptyState';

interface FollowUpManagerProps {
  followUps: FollowUp[];
  leads: Lead[];
  onOpenLeadDetail: (lead: Lead) => void;
  onUpdateCall: (lead: Lead) => void;
  initialTab?: 'today' | 'overdue' | 'upcoming' | 'completed' | 'missed';
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  followUps,
  leads,
  onOpenLeadDetail,
  onUpdateCall,
  initialTab = 'today',
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'today' | 'overdue' | 'upcoming' | 'completed' | 'missed'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reschedule state modal
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUp | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00');

  const todayStr = new Date().toISOString().split('T')[0];

  // Grouped Follow-ups
  const categorized = useMemo(() => {
    const today: FollowUp[] = [];
    const overdue: FollowUp[] = [];
    const upcoming: FollowUp[] = [];
    const completed: FollowUp[] = [];
    const missed: FollowUp[] = [];

    followUps.forEach(fup => {
      if (fup.status === 'completed') {
        completed.push(fup);
        return;
      }

      if (fup.status === 'missed') {
        missed.push(fup);
        return;
      }

      // If pending
      if (fup.dueDate === todayStr) {
        today.push(fup);
      } else if (fup.dueDate < todayStr) {
        overdue.push(fup);
      } else {
        upcoming.push(fup);
      }
    });

    return { today, overdue, upcoming, completed, missed };
  }, [followUps, todayStr]);

  const currentList = categorized[activeTab].filter(f => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      f.companyName.toLowerCase().includes(s) ||
      f.contactPerson.toLowerCase().includes(s) ||
      f.mobileNumber.includes(s) ||
      (f.notes && f.notes.toLowerCase().includes(s))
    );
  });

  const handleMarkComplete = async (fup: FollowUp) => {
    if (!user) return;
    try {
      await markFollowUpCompleted(fup.id, user);
      showToast(`Follow-up for ${fup.companyName} marked as completed.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update follow-up.', 'error');
    }
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleTarget || !newDate || !user) return;
    try {
      await rescheduleFollowUp(rescheduleTarget.id, newDate, newTime, user);
      showToast(`Follow-up rescheduled to ${newDate} ${newTime}.`, 'success');
      setRescheduleTarget(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to reschedule follow-up.', 'error');
    }
  };

  const findLead = (leadDocId: string): Lead | undefined => {
    return leads.find(l => l.id === leadDocId);
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation Headers */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Today's Follow-ups</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'today' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {categorized.today.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <ClockAlert className="w-4 h-4" />
          <span>Overdue Follow-ups</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'overdue' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-700 font-bold'}`}>
            {categorized.overdue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'upcoming' ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {categorized.upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'completed' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {categorized.completed.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('missed')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'missed'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Missed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'missed' ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {categorized.missed.length}
          </span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, contact person, or notes..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total: <strong className="text-slate-900">{currentList.length}</strong> items
        </div>
      </div>

      {/* List Content */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Follow-ups in this View"
          description={
            activeTab === 'overdue'
              ? "Great job! There are no overdue follow-ups."
              : `No follow-ups categorized as ${activeTab}.`
          }
        />
      ) : (
        <div className="space-y-3">
          {currentList.map((fup) => {
            const parentLead = findLead(fup.leadDocId);
            const isOverdue = fup.status === 'pending' && fup.dueDate < todayStr;

            return (
              <div
                key={fup.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isOverdue ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Left: Lead details & notes */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 
                      onClick={() => parentLead && onOpenLeadDetail(parentLead)}
                      className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {fup.companyName}
                    </h3>
                    {fup.leadCode && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {fup.leadCode}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        <ClockAlert className="w-3 h-3" /> Overdue
                      </span>
                    )}
                    {fup.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{fup.contactPerson}</span>
                    <span>•</span>
                    <a
                      href={`tel:${fup.mobileNumber}`}
                      className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {fup.mobileNumber}
                    </a>
                    <span>•</span>
                    <span className="text-slate-500">
                      Assigned: <strong className="text-slate-700">{fup.assignedStaffName}</strong>
                    </span>
                  </div>

                  {fup.notes && (
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-150">
                      <strong className="text-slate-900">Follow-up Note:</strong> {fup.notes}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Scheduled Due: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>{fup.dueDate} {fup.dueTime || ''}</strong></span>
                    {fup.completedAt && (
                      <span className="text-emerald-700">• Completed on {new Date(fup.completedAt).toLocaleString()} by {fup.completedBy}</span>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <a
                    href={`tel:${fup.mobileNumber}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Now</span>
                  </a>

                  {parentLead && (
                    <button
                      onClick={() => onUpdateCall(parentLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Update Call</span>
                    </button>
                  )}

                  {fup.status !== 'completed' && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleTarget(fup);
                          setNewDate(fup.dueDate);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Reschedule Follow-up"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => handleMarkComplete(fup)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Done</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reschedule Follow-up
            </h3>
            <p className="text-xs text-slate-500">
              Set a new target contact date for <strong>{rescheduleTarget.companyName}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Date</label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
              >
                Save New Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

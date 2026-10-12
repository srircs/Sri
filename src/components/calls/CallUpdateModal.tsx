import React, { useState } from 'react';
import { 
  X, 
  PhoneCall, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  UserCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead } from '../../types';
import { CALL_OUTCOMES, DEFAULT_LEAD_STATUSES } from '../../utils/constants';
import { logCallActivity } from '../../services/callActivityService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface CallUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updatedStatus: string) => void;
}

export const CallUpdateModal: React.FC<CallUpdateModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default to current local datetime in ISO input format
  const currentLocalISO = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [callDateTime, setCallDateTime] = useState(currentLocalISO);
  const [callOutcome, setCallOutcome] = useState(CALL_OUTCOMES[0]);
  const [customerResponse, setCustomerResponse] = useState('');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [customerRequirement, setCustomerRequirement] = useState('');
  const [interestLevel, setInterestLevel] = useState<'High' | 'Medium' | 'Low' | 'None'>('Medium');
  const [updatedStatus, setUpdatedStatus] = useState(lead?.status || 'Call Connected');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isOpen || !lead || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!callOutcome) {
      showToast('Please select a Call Outcome.', 'error');
      return;
    }

    if (!discussionSummary.trim()) {
      showToast('Please provide a Discussion Summary.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await logCallActivity({
        lead,
        staffUser: user,
        callData: {
          callDateTime,
          callOutcome,
          customerResponse: customerResponse.trim(),
          discussionSummary: discussionSummary.trim(),
          customerRequirement: customerRequirement.trim(),
          interestLevel,
          updatedStatus,
          nextFollowUpDate,
          nextAction: nextAction.trim(),
          additionalNotes: additionalNotes.trim(),
        },
      });

      if (updatedStatus === 'Converted') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast('🎉 Congratulations! Lead converted successfully!', 'success');
      } else {
        showToast('Call activity recorded and lead updated successfully.', 'success');
      }

      onSuccess(updatedStatus);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to record call activity.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Record Call Outcome</h2>
              <p className="text-xs text-slate-400">
                {lead.companyName} ({lead.contactPerson}) • {lead.mobileNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-800">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Calls are initiated through your phone device. Please log the conversation details below.</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Call Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={callDateTime}
                onChange={(e) => setCallDateTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Call Outcome <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
              >
                {CALL_OUTCOMES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer Interest Level
              </label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
              >
                <option value="High">🟢 High Interest</option>
                <option value="Medium">🟡 Medium Interest</option>
                <option value="Low">🔵 Low Interest</option>
                <option value="None">⚪ None / Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Updated Lead Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={updatedStatus}
                onChange={(e) => setUpdatedStatus(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-semibold text-blue-700"
              >
                {DEFAULT_LEAD_STATUSES.map((st) => (
                  <option key={st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Discussion Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={discussionSummary}
              onChange={(e) => setDiscussionSummary(e.target.value)}
              placeholder="Key points discussed during the call, client questions, pricing discussions..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer Requirement / Feedback
              </label>
              <input
                type="text"
                value={customerRequirement}
                onChange={(e) => setCustomerRequirement(e.target.value)}
                placeholder="Product specs, quantity, budget..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Customer Direct Response
              </label>
              <input
                type="text"
                value={customerResponse}
                onChange={(e) => setCustomerResponse(e.target.value)}
                placeholder="Exact quotes, hesitation, or approval..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Schedule Next Follow-up
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Next Follow-up Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Planned Next Action
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Share quotation, Visit factory..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Internal Notes (Appended to lead record)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Private note for your team or manager..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Complete & Save Call</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Clock, 
  PhoneCall, 
  FileText, 
  Edit3, 
  Trash2, 
  History, 
  Tag, 
  Share2,
  TrendingUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Lead, CallActivity, UserProfile } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { subscribeToLeadCallActivities } from '../../services/callActivityService';
import { deleteLead } from '../../services/leadsService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onUpdateCall: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteSuccess: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateCall,
  onEditLead,
  onDeleteSuccess,
}) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [callHistory, setCallHistory] = useState<CallActivity[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      const unsub = subscribeToLeadCallActivities(
        lead.id,
        setCallHistory,
        (err) => console.error('Call history subscription error:', err)
      );
      return () => unsub();
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    if (!isAdmin || !user) return;
    setIsDeleting(true);
    try {
      await deleteLead(lead.id, user);
      showToast(`Lead "${lead.companyName}" deleted successfully.`, 'info');
      onDeleteSuccess(lead.id);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete lead.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-scale-in">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white leading-tight">{lead.companyName}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {lead.leadId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Contact: <span className="text-slate-200 font-semibold">{lead.contactPerson}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => onEditLead(lead)}
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit Lead"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete Lead"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Banner */}
        {confirmDelete && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center justify-between text-xs text-rose-900">
            <span>Are you sure you want to permanently delete this lead? This action cannot be undone.</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1 bg-white border border-rose-300 rounded text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Action Call Banner: Prominent for Staff & Admin */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
            <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Assigned: <strong className="text-slate-900">{lead.assignedStaffName || 'Unassigned'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Click-to-call mobile */}
            <a
              href={`tel:${lead.mobileNumber}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Call: {lead.mobileNumber}</span>
            </a>

            {/* Prominent Update Call button */}
            <button
              onClick={() => onUpdateCall(lead)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Update Call</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* Section: Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Contact Details
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${lead.mobileNumber}`} className="font-semibold text-blue-600 hover:underline">
                    {lead.mobileNumber}
                  </a>
                  {lead.alternatePhone && (
                    <span className="text-slate-400">/ {lead.alternatePhone}</span>
                  )}
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline truncate">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lead.website}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Business & Location
              </span>
              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400">Category: </span>
                  <span className="font-semibold">{lead.businessCategory || 'Not specified'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {lead.cityArea && <strong className="text-slate-900">{lead.cityArea}</strong>}
                    {lead.fullAddress && ` — ${lead.fullAddress}`}
                    {!lead.cityArea && !lead.fullAddress && 'No address recorded'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Lead Source: </span>
                  <span className="font-semibold">{lead.leadSource}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Schedule & Follow-up
              </span>
              <div className="space-y-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400">Next Follow-up: </span>
                  <span className="font-bold text-indigo-700">
                    {lead.nextFollowUpDate
                      ? new Date(lead.nextFollowUpDate).toLocaleString()
                      : 'None scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Last Contact: </span>
                  <span>
                    {lead.lastContactDate
                      ? new Date(lead.lastContactDate).toLocaleString()
                      : 'Not contacted yet'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Last Outcome: </span>
                  <span className="font-medium text-slate-900">
                    {lead.lastCallOutcome || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Requirement and Notes */}
          {(lead.requirement || lead.additionalNotes) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.requirement && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Product / Service Requirement
                  </h4>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {lead.requirement}
                  </p>
                </div>
              )}
              {lead.additionalNotes && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Notes & Remarks
                  </h4>
                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {lead.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Historical Call Activity Log */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Call Activity History ({callHistory.length})
              </h3>
              <span className="text-[11px] text-slate-400">
                Permanent activity log • Cannot be erased
              </span>
            </div>

            {callHistory.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
                No calls have been recorded for this lead yet. Click "Update Call" above to record the first conversation.
              </div>
            ) : (
              <div className="space-y-3">
                {callHistory.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{act.callOutcome}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          Interest: {act.interestLevel || 'Medium'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(act.callDateTime).toLocaleString()} by <strong className="text-slate-700">{act.staffName}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed mb-2 font-medium">
                      {act.discussionSummary}
                    </p>

                    {act.customerResponse && (
                      <p className="text-xs text-slate-600 italic mb-2">
                        Response: "{act.customerResponse}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>
                        Status: <strong className="text-slate-800">{act.previousStatus} → {act.updatedStatus}</strong>
                      </span>
                      {act.nextFollowUpDate && (
                        <span>
                          Next Follow-up: <strong className="text-indigo-600">{new Date(act.nextFollowUpDate).toLocaleString()}</strong>
                        </span>
                      )}
                      {act.nextAction && (
                        <span>Next Action: <strong className="text-slate-800">{act.nextAction}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

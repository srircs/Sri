import React from 'react';
import { 
  Building2, 
  Phone, 
  User, 
  Calendar, 
  MapPin, 
  PhoneCall, 
  ChevronRight, 
  ClockAlert 
} from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';

interface LeadCardProps {
  lead: Lead;
  onOpenDetail: (lead: Lead) => void;
  onUpdateCall: (lead: Lead) => void;
  showAssignee?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onOpenDetail,
  onUpdateCall,
  showAssignee = true,
}) => {
  const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top bar: Lead ID, Priority & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
            {lead.leadId}
          </span>
          <div className="flex items-center gap-1.5">
            <PriorityBadge priority={lead.priority} />
            <StatusBadge status={lead.status} size="sm" />
          </div>
        </div>

        {/* Company & Contact */}
        <h3 
          onClick={() => onOpenDetail(lead)}
          className="text-base font-bold text-slate-900 leading-snug cursor-pointer hover:text-blue-600 transition-colors"
        >
          {lead.companyName}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 mb-3">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800">{lead.contactPerson}</span>
          {lead.cityArea && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 truncate">{lead.cityArea}</span>
            </>
          )}
        </div>

        {/* Product requirement or notes snippet */}
        {lead.requirement && (
          <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg mb-3 border border-slate-100">
            <strong className="text-slate-800">Req:</strong> {lead.requirement}
          </p>
        )}

        {/* Schedule & Follow-up indicators */}
        <div className="space-y-1 text-xs pt-2 border-t border-slate-100 mb-3">
          {lead.nextFollowUpDate ? (
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-rose-600' : 'text-indigo-600'}`}>
              {isOverdue ? <ClockAlert className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              <span>
                {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                {new Date(lead.nextFollowUpDate).toLocaleDateString()} {new Date(lead.nextFollowUpDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <div className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>No follow-up scheduled</span>
            </div>
          )}

          {showAssignee && (
            <div className="text-[11px] text-slate-500">
              Staff: <strong className="text-slate-700">{lead.assignedStaffName || 'Unassigned'}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <a
          href={`tel:${lead.mobileNumber}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-bold transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Call</span>
        </a>

        <button
          onClick={() => onUpdateCall(lead)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Update Call</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Building2, 
  Phone, 
  User, 
  Calendar, 
  ClockAlert, 
  PhoneCall, 
  MoreVertical, 
  MoveRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lead, UserProfile, SystemStatusConfig } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { DEFAULT_LEAD_STATUSES, STATUS_COLOR_MAP } from '../../utils/constants';
import { updateLead } from '../../services/leadsService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface LeadsKanbanBoardProps {
  leads: Lead[];
  onOpenDetail: (lead: Lead) => void;
  onUpdateCall: (lead: Lead) => void;
  isAdmin: boolean;
  statuses?: SystemStatusConfig[];
}

export const LeadsKanbanBoard: React.FC<LeadsKanbanBoardProps> = ({
  leads,
  onOpenDetail,
  onUpdateCall,
  isAdmin,
  statuses = DEFAULT_LEAD_STATUSES,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [movingLeadId, setMovingLeadId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLeadId(lead.id);
    e.dataTransfer.setData('text/plain', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, statusName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== statusName) {
      setDragOverColumn(statusName);
    }
  };

  const handleDragLeave = (statusName: string) => {
    if (dragOverColumn === statusName) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverColumn(null);
    setDraggedLeadId(null);

    if (!leadId || !user) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    await executeStatusChange(lead, targetStatus);
  };

  const executeStatusChange = async (lead: Lead, targetStatus: string) => {
    if (!user) return;
    setMovingLeadId(lead.id);

    try {
      await updateLead({
        leadId: lead.id,
        updates: {
          status: targetStatus,
          updatedAt: new Date().toISOString(),
        },
        actor: user,
      });

      if (targetStatus === 'Converted') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        showToast(`🎉 "${lead.companyName}" marked as Converted!`, 'success');
      } else {
        showToast(`Moved "${lead.companyName}" to ${targetStatus}.`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update lead status.', 'error');
    } finally {
      setMovingLeadId(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-1 select-none">
      {/* Horizontal Kanban Columns Container */}
      <div className="inline-flex gap-4 min-w-full items-start px-1">
        {statuses.map((statusConfig) => {
          const statusName = statusConfig.name;
          const columnLeads = leads.filter((l) => l.status === statusName);
          const isOver = dragOverColumn === statusName;
          const statusStyle = STATUS_COLOR_MAP[statusName] || {
            bg: 'bg-slate-50',
            text: 'text-slate-700',
            border: 'border-slate-200',
            dot: 'bg-slate-400',
          };

          return (
            <div
              key={statusConfig.id || statusName}
              onDragOver={(e) => handleDragOver(e, statusName)}
              onDragLeave={() => handleDragLeave(statusName)}
              onDrop={(e) => handleDrop(e, statusName)}
              className={`w-72 sm:w-80 shrink-0 flex flex-col max-h-[calc(100vh-13rem)] rounded-2xl border transition-all duration-200 ${
                isOver
                  ? 'bg-blue-50/80 border-blue-400 border-dashed shadow-lg ring-2 ring-blue-400/20'
                  : 'bg-slate-100/70 border-slate-200/80 shadow-xs'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white/70 backdrop-blur-xs rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot} shrink-0`} />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {statusName}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {columnLeads.length}
                </span>
              </div>

              {/* Column Body / Scrollable Cards */}
              <div className="p-2.5 overflow-y-auto flex-1 space-y-2.5 min-h-[140px]">
                {columnLeads.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center p-3 text-slate-400 text-xs">
                    {isOver ? 'Drop lead here' : 'No leads in this stage'}
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
                    const isBeingMoved = movingLeadId === lead.id;
                    const isDraggingThis = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-grab active:cursor-grabbing relative ${
                          isDraggingThis ? 'opacity-40 scale-95' : 'opacity-100'
                        } ${isBeingMoved ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        {/* Top: Lead ID & Priority */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {lead.leadId}
                          </span>
                          <PriorityBadge priority={lead.priority} />
                        </div>

                        {/* Company Name */}
                        <h4
                          onClick={() => onOpenDetail(lead)}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors leading-snug cursor-pointer mb-1"
                        >
                          {lead.companyName}
                        </h4>

                        {/* Contact Person & Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{lead.contactPerson}</span>
                          {lead.cityArea && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 truncate text-[11px]">{lead.cityArea}</span>
                            </>
                          )}
                        </div>

                        {/* Follow-up Due info */}
                        {lead.nextFollowUpDate && (
                          <div className={`text-[11px] font-medium flex items-center gap-1 mb-2.5 ${
                            isOverdue ? 'text-rose-600 font-bold' : 'text-indigo-600'
                          }`}>
                            {isOverdue ? <ClockAlert className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                            <span>
                              {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                              {new Date(lead.nextFollowUpDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Assignee if Admin */}
                        {isAdmin && (
                          <div className="text-[11px] text-slate-400 mb-3">
                            Staff: <strong className="text-slate-700">{lead.assignedStaffName || 'Unassigned'}</strong>
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          {/* Click to call link */}
                          <a
                            href={`tel:${lead.mobileNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                            title={`Call ${lead.mobileNumber}`}
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Call</span>
                          </a>

                          <div className="flex items-center gap-1">
                            {/* Update Call action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateCall(lead);
                              }}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Update Call & Outcome"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Update</span>
                            </button>

                            {/* Mobile / Accessible Move Stage Dropdown */}
                            <div className="relative group">
                              <select
                                value={lead.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  executeStatusChange(lead, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                title="Change status"
                              >
                                {statuses.map((st) => (
                                  <option key={st.name} value={st.name}>
                                    Move to: {st.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                                title="Move lead status"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Eye, 
  PhoneCall, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon,
  ClockAlert,
  Calendar,
  X,
  Kanban
} from 'lucide-react';
import { Lead, UserProfile } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { LeadCard } from './LeadCard';
import { LeadsKanbanBoard } from './LeadsKanbanBoard';
import { EmptyState } from '../common/EmptyState';
import { LEAD_SOURCES, DEFAULT_LEAD_STATUSES } from '../../utils/constants';

interface LeadsTableProps {
  leads: Lead[];
  onOpenDetail: (lead: Lead) => void;
  onUpdateCall: (lead: Lead) => void;
  staffList?: UserProfile[];
  isAdmin: boolean;
  onOpenAddModal?: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onOpenDetail,
  onUpdateCall,
  staffList = [],
  isAdmin,
  onOpenAddModal,
}) => {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  
  // Sorting & View
  const [sortBy, setSortBy] = useState<'createdAt' | 'nextFollowUpDate' | 'priority' | 'companyName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        lead.companyName.toLowerCase().includes(search) ||
        lead.contactPerson.toLowerCase().includes(search) ||
        lead.mobileNumber.includes(search) ||
        lead.leadId.toLowerCase().includes(search) ||
        (lead.cityArea && lead.cityArea.toLowerCase().includes(search));

      if (!matchSearch) return false;

      // Status
      if (selectedStatus !== 'ALL' && lead.status !== selectedStatus) {
        return false;
      }

      // Staff (Admin filter)
      if (isAdmin && selectedStaff !== 'ALL') {
        if (selectedStaff === 'unassigned') {
          if (lead.assignedStaffId) return false;
        } else if (lead.assignedStaffId !== selectedStaff) {
          return false;
        }
      }

      // Source
      if (selectedSource !== 'ALL' && lead.leadSource !== selectedSource) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'ALL' && lead.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [leads, searchTerm, selectedStatus, selectedStaff, selectedSource, selectedPriority, isAdmin]);

  // Sorted Leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comp = 0;
      if (sortBy === 'createdAt') {
        comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'nextFollowUpDate') {
        const da = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : 9999999999999;
        const db = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : 9999999999999;
        comp = da - db;
      } else if (sortBy === 'companyName') {
        comp = a.companyName.localeCompare(b.companyName);
      } else if (sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        comp = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      return sortOrder === 'asc' ? -comp : comp;
    });
  }, [filteredLeads, sortBy, sortOrder]);

  // Paged Leads
  const totalPages = Math.ceil(sortedLeads.length / pageSize) || 1;
  const pagedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLeads.slice(start, start + pageSize);
  }, [sortedLeads, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = [
      'Lead ID',
      'Company Name',
      'Contact Person',
      'Mobile Number',
      'Email',
      'City Area',
      'Lead Source',
      'Priority',
      'Assigned Staff',
      'Status',
      'Next Follow-up',
      'Last Contact',
      'Created Date'
    ];

    const rows = sortedLeads.map((l: Lead) => [
      `"${l.leadId}"`,
      `"${l.companyName.replace(/"/g, '""')}"`,
      `"${l.contactPerson.replace(/"/g, '""')}"`,
      `"${l.mobileNumber}"`,
      `"${l.email || ''}"`,
      `"${l.cityArea || ''}"`,
      `"${l.leadSource}"`,
      `"${l.priority}"`,
      `"${l.assignedStaffName || 'Unassigned'}"`,
      `"${l.status}"`,
      `"${l.nextFollowUpDate || ''}"`,
      `"${l.lastContactDate || ''}"`,
      `"${l.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sri_Groups_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedStaff('ALL');
    setSelectedSource('ALL');
    setSelectedPriority('ALL');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedStatus !== 'ALL' || selectedStaff !== 'ALL' || selectedSource !== 'ALL' || selectedPriority !== 'ALL';

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search company, contact, phone, or Lead ID..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle & CSV Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${viewMode === 'table' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
                <span className="text-[11px] hidden md:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${viewMode === 'cards' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                title="Grid / Card View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[11px] hidden md:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md flex items-center gap-1.5 transition-all ${viewMode === 'kanban' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
                title="Kanban Board View (Drag & Drop)"
              >
                <Kanban className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-semibold">Kanban</span>
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Export filtered leads to CSV"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Statuses</option>
              {DEFAULT_LEAD_STATUSES.map(st => (
                <option key={st.name} value={st.name}>{st.name}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div>
              <select
                value={selectedStaff}
                onChange={(e) => { setSelectedStaff(e.target.value); setCurrentPage(1); }}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Staff Members</option>
                <option value="unassigned">Unassigned Leads</option>
                {staffList.map(s => (
                  <option key={s.uid} value={s.uid}>{s.displayName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <select
              value={selectedSource}
              onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Sources</option>
              {LEAD_SOURCES.map(src => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedPriority}
              onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-medium outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold hover:bg-rose-50 rounded-md transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Result Counter & Sorting Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <strong className="text-slate-900">{filteredLeads.length}</strong> {filteredLeads.length === 1 ? 'lead' : 'leads'}
          {viewMode === 'kanban' && <span className="text-indigo-600 font-semibold ml-2">• Drag and drop across pipeline stages</span>}
        </div>
        {viewMode !== 'kanban' && (
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 outline-none"
            >
              <option value="createdAt">Date Created</option>
              <option value="nextFollowUpDate">Next Follow-up</option>
              <option value="priority">Priority</option>
              <option value="companyName">Company Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-slate-100 rounded text-slate-600"
              title="Toggle Asc/Desc"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Leads Content */}
      {viewMode === 'kanban' ? (
        <LeadsKanbanBoard
          leads={filteredLeads}
          onOpenDetail={onOpenDetail}
          onUpdateCall={onUpdateCall}
          isAdmin={isAdmin}
        />
      ) : sortedLeads.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Leads Found"
          description={hasActiveFilters ? "Try broadening your search or resetting filters." : "No leads exist in the database yet."}
          actionText={isAdmin && onOpenAddModal ? "Add First Lead" : undefined}
          onAction={onOpenAddModal}
        />
      ) : viewMode === 'cards' ? (
        /* Grid / Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pagedLeads.map((lead: Lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onOpenDetail={onOpenDetail}
              onUpdateCall={onUpdateCall}
              showAssignee={isAdmin}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  {isAdmin && <th className="py-3 px-4">Assigned Staff</th>}
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pagedLeads.map((lead: Lead) => {
                  const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
                  return (
                    <tr 
                      key={lead.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onOpenDetail(lead)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {lead.leadId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{lead.companyName}</div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <span>{lead.contactPerson}</span>
                          {lead.cityArea && <span className="text-slate-400">• {lead.cityArea}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`tel:${lead.mobileNumber}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lead.mobileNumber}</span>
                        </a>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={lead.priority} />
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                          {lead.assignedStaffName || <span className="text-slate-400 italic">Unassigned</span>}
                        </td>
                      )}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {lead.nextFollowUpDate ? (
                          <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {isOverdue && <ClockAlert className="w-3.5 h-3.5" />}
                            <span>{new Date(lead.nextFollowUpDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateCall(lead)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md font-semibold transition-colors flex items-center gap-1 text-[11px]"
                            title="Record Call Outcome"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Update Call</span>
                          </button>
                          <button
                            onClick={() => onOpenDetail(lead)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="View Full Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-white border border-slate-300 rounded px-2 py-1 outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold disabled:opacity-50 hover:bg-slate-100"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-semibold disabled:opacity-50 hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

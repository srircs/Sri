import { SystemStatusConfig, LeadSource } from '../types';

export const ADMIN_PRIMARY_EMAIL = 'rcssri14@gmail.com';

export const DEFAULT_LEAD_STATUSES: SystemStatusConfig[] = [
  { id: 'new-lead', name: 'New Lead', color: 'blue', order: 1 },
  { id: 'not-contacted', name: 'Not Contacted', color: 'slate', order: 2 },
  { id: 'call-connected', name: 'Call Connected', color: 'cyan', order: 3 },
  { id: 'not-reachable', name: 'Not Reachable', color: 'amber', order: 4 },
  { id: 'callback-requested', name: 'Call Back Requested', color: 'orange', order: 5 },
  { id: 'followup-pending', name: 'Follow-up Pending', color: 'indigo', order: 6 },
  { id: 'interested', name: 'Interested', color: 'violet', order: 7 },
  { id: 'requirement-collected', name: 'Requirement Collected', color: 'teal', order: 8 },
  { id: 'proposal-sent', name: 'Proposal Sent', color: 'sky', order: 9 },
  { id: 'negotiation', name: 'Negotiation', color: 'purple', order: 10 },
  { id: 'converted', name: 'Converted', color: 'emerald', order: 11, isTerminal: true },
  { id: 'not-interested', name: 'Not Interested', color: 'rose', order: 12, isTerminal: true },
  { id: 'lost-lead', name: 'Lost Lead', color: 'red', order: 13, isTerminal: true },
];

export const LEAD_SOURCES: LeadSource[] = [
  'Website',
  'Referral',
  'IndiaMART',
  'Cold Call',
  'Exhibition',
  'WhatsApp',
  'Other',
];

export const BUSINESS_CATEGORIES = [
  'Manufacturing & Industrial',
  'Construction & Infrastructure',
  'Real Estate & Property',
  'IT & Software Solutions',
  'Retail & Wholesale Distribution',
  'Healthcare & Pharma',
  'Education & Training',
  'Logistics & Supply Chain',
  'Automotive & Engineering',
  'Hospitality & Tourism',
  'Financial Services & Trading',
  'Other Commercial',
];

export const CALL_OUTCOMES = [
  'Connected - Highly Interested',
  'Connected - Call Back Requested',
  'Connected - Requirement Collected',
  'Connected - Send Proposal / Brochure',
  'Connected - Negotiation in Progress',
  'Connected - Lead Converted',
  'Connected - Not Interested',
  'Not Reachable / Out of Coverage',
  'Line Busy / Call Disconnected',
  'Ringing No Response',
  'Switched Off',
  'Invalid / Wrong Number',
];

export const STATUS_COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'New Lead': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  'Not Contacted': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500' },
  'Call Connected': { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500' },
  'Not Reachable': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Call Back Requested': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Follow-up Pending': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  'Interested': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'Requirement Collected': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  'Proposal Sent': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'Negotiation': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'Converted': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  'Not Interested': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'Lost Lead': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
};

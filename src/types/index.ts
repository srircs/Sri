export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'IndiaMART'
  | 'Cold Call'
  | 'Exhibition'
  | 'WhatsApp'
  | 'Other';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export type StandardLeadStatus =
  | 'New Lead'
  | 'Not Contacted'
  | 'Call Connected'
  | 'Not Reachable'
  | 'Call Back Requested'
  | 'Follow-up Pending'
  | 'Interested'
  | 'Requirement Collected'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Converted'
  | 'Not Interested'
  | 'Lost Lead';

export interface Lead {
  id: string; // Firestore document ID
  leadId: string; // Human-friendly readable ID like SRI-LD-1001
  companyName: string;
  contactPerson: string;
  mobileNumber: string;
  alternatePhone?: string;
  email?: string;
  businessCategory?: string;
  cityArea?: string;
  fullAddress?: string;
  website?: string;
  leadSource: LeadSource;
  requirement?: string;
  priority: LeadPriority;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: string; // One of StandardLeadStatus or configured status
  lastContactDate?: string;
  lastCallOutcome?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  additionalNotes?: string;
}

export type CallInterestLevel = 'High' | 'Medium' | 'Low' | 'None';

export interface CallActivity {
  id: string;
  leadDocId: string;
  leadCode?: string;
  companyName?: string;
  contactPerson?: string;
  mobileNumber?: string;
  staffId: string;
  staffName: string;
  callDateTime: string;
  callOutcome: string;
  customerResponse?: string;
  discussionSummary: string;
  customerRequirement?: string;
  interestLevel?: CallInterestLevel;
  previousStatus?: string;
  updatedStatus: string;
  nextFollowUpDate?: string;
  nextAction?: string;
  additionalNotes?: string;
  createdAt: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'missed';

export interface FollowUp {
  id: string;
  leadDocId: string;
  leadCode?: string;
  companyName: string;
  contactPerson: string;
  mobileNumber: string;
  assignedStaffId: string;
  assignedStaffName: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: FollowUpStatus;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'staff' | 'system';
  action: string;
  targetType: string; // 'Lead' | 'Staff' | 'CallActivity' | 'FollowUp' | 'Settings'
  targetId: string;
  targetSummary: string;
  details?: string;
  timestamp: string;
}

export interface SystemStatusConfig {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  order: number;
  isTerminal?: boolean;
}

export interface SystemSettings {
  id: string;
  companyName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  statuses: SystemStatusConfig[];
  sources: string[];
}

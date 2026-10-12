import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Lead, UserProfile } from '../types';
import { logAuditEvent } from './auditService';

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

/**
 * Checks for existing leads with matching mobile number or company name to prevent duplicates
 */
export async function checkDuplicateLead(mobile: string, companyName: string, excludeDocId?: string): Promise<{
  hasDuplicate: boolean;
  duplicateByPhone?: Lead;
  duplicateByName?: Lead;
}> {
  const normPhone = normalizePhone(mobile);
  const cleanComp = companyName.trim().toLowerCase();

  const allSnap = await getDocs(collection(db, 'leads'));
  const allLeads = allSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as Lead))
    .filter(l => l.id !== excludeDocId);

  const phoneMatch = allLeads.find(l => normalizePhone(l.mobileNumber) === normPhone);
  const nameMatch = allLeads.find(l => l.companyName.trim().toLowerCase() === cleanComp);

  return {
    hasDuplicate: Boolean(phoneMatch || nameMatch),
    duplicateByPhone: phoneMatch,
    duplicateByName: nameMatch,
  };
}

/**
 * Generates an enterprise readable Lead ID (e.g., SRI-LD-84021)
 */
export function generateReadableLeadId(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `SRI-LD-${randomSuffix}`;
}

export async function createLead(params: {
  leadData: Omit<Lead, 'id' | 'leadId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>;
  adminUser: UserProfile;
}): Promise<Lead> {
  const leadDocId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const humanId = generateReadableLeadId();
  const now = new Date().toISOString();

  const newLead: Lead = {
    ...params.leadData,
    id: leadDocId,
    leadId: humanId,
    createdAt: now,
    updatedAt: now,
    createdBy: params.adminUser.uid,
    createdByName: params.adminUser.displayName,
    assignedStaffId: params.leadData.assignedStaffId || '',
    assignedStaffName: params.leadData.assignedStaffName || 'Unassigned',
  };

  try {
    await setDoc(doc(db, 'leads', leadDocId), newLead);

    await logAuditEvent({
      actorId: params.adminUser.uid,
      actorName: params.adminUser.displayName,
      actorRole: params.adminUser.role,
      action: 'Lead Created',
      targetType: 'Lead',
      targetId: leadDocId,
      targetSummary: `${newLead.companyName} (${humanId})`,
      details: `Assigned to: ${newLead.assignedStaffName || 'Unassigned'}. Source: ${newLead.leadSource}`,
    });

    return newLead;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `leads/${leadDocId}`);
    throw error;
  }
}

export async function updateLead(params: {
  leadId: string;
  updates: Partial<Lead>;
  actor: UserProfile;
}): Promise<void> {
  const leadRef = doc(db, 'leads', params.leadId);
  const now = new Date().toISOString();

  try {
    const existingSnap = await getDoc(leadRef);
    if (!existingSnap.exists()) {
      throw new Error('Lead not found.');
    }
    const currentLead = existingSnap.data() as Lead;

    const payload: Partial<Lead> = {
      ...params.updates,
      updatedAt: now,
    };

    await updateDoc(leadRef, payload);

    await logAuditEvent({
      actorId: params.actor.uid,
      actorName: params.actor.displayName,
      actorRole: params.actor.role,
      action: params.updates.assignedStaffId !== undefined ? 'Lead Reassigned' : 'Lead Updated',
      targetType: 'Lead',
      targetId: params.leadId,
      targetSummary: `${currentLead.companyName} (${currentLead.leadId})`,
      details: `Updated fields: ${Object.keys(params.updates).join(', ')}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${params.leadId}`);
  }
}

export async function deleteLead(leadId: string, adminUser: UserProfile): Promise<void> {
  if (adminUser.role !== 'admin') {
    throw new Error('Unauthorized: Only administrators can delete company leads.');
  }

  const leadRef = doc(db, 'leads', leadId);
  try {
    const snap = await getDoc(leadRef);
    const leadData = snap.exists() ? (snap.data() as Lead) : null;

    await deleteDoc(leadRef);

    if (leadData) {
      await logAuditEvent({
        actorId: adminUser.uid,
        actorName: adminUser.displayName,
        actorRole: 'admin',
        action: 'Lead Deleted',
        targetType: 'Lead',
        targetId: leadId,
        targetSummary: `${leadData.companyName} (${leadData.leadId})`,
        details: `Lead permanently deleted by administrator.`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${leadId}`);
  }
}

export function subscribeToLeads(
  user: UserProfile,
  onUpdate: (leads: Lead[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, 'leads');
  
  // Security & Query enforcement: Admin sees all; Staff strictly queries only assigned leads
  const q = user.role === 'admin'
    ? query(collectionRef, orderBy('createdAt', 'desc'))
    : query(collectionRef, where('assignedStaffId', '==', user.uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const leads = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
      // In-memory sort by newest if staff query doesn't have composite index
      leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(leads);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'leads');
    }
  );
}

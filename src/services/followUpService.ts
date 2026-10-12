import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FollowUp, UserProfile } from '../types';
import { logAuditEvent } from './auditService';

export async function createFollowUp(params: {
  leadDocId: string;
  leadCode?: string;
  companyName: string;
  contactPerson: string;
  mobileNumber: string;
  assignedStaffId: string;
  assignedStaffName: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  actor: UserProfile;
}): Promise<FollowUp> {
  const followUpId = 'fup_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const record: FollowUp = {
    id: followUpId,
    leadDocId: params.leadDocId,
    leadCode: params.leadCode,
    companyName: params.companyName,
    contactPerson: params.contactPerson,
    mobileNumber: params.mobileNumber,
    assignedStaffId: params.assignedStaffId,
    assignedStaffName: params.assignedStaffName,
    dueDate: params.dueDate,
    dueTime: params.dueTime || '',
    status: 'pending',
    notes: params.notes || '',
    createdAt: now,
  };

  try {
    await setDoc(doc(db, 'follow_ups', followUpId), record);
    
    await logAuditEvent({
      actorId: params.actor.uid,
      actorName: params.actor.displayName,
      actorRole: params.actor.role,
      action: 'Follow-up Scheduled',
      targetType: 'FollowUp',
      targetId: followUpId,
      targetSummary: `${params.companyName} (${params.dueDate})`,
      details: `Scheduled for ${params.assignedStaffName}`,
    });

    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `follow_ups/${followUpId}`);
    throw error;
  }
}

export async function markFollowUpCompleted(
  followUpId: string,
  actor: UserProfile,
  notes?: string
): Promise<void> {
  const fupRef = doc(db, 'follow_ups', followUpId);
  const now = new Date().toISOString();

  try {
    await updateDoc(fupRef, {
      status: 'completed',
      completedAt: now,
      completedBy: actor.displayName,
      ...(notes ? { notes } : {}),
    });

    await logAuditEvent({
      actorId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'Follow-up Completed',
      targetType: 'FollowUp',
      targetId: followUpId,
      targetSummary: `Follow-up resolved by ${actor.displayName}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `follow_ups/${followUpId}`);
  }
}

export async function rescheduleFollowUp(
  followUpId: string,
  newDueDate: string,
  newDueTime: string,
  actor: UserProfile
): Promise<void> {
  const fupRef = doc(db, 'follow_ups', followUpId);
  try {
    await updateDoc(fupRef, {
      dueDate: newDueDate,
      dueTime: newDueTime,
      status: 'pending',
    });

    await logAuditEvent({
      actorId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action: 'Follow-up Rescheduled',
      targetType: 'FollowUp',
      targetId: followUpId,
      targetSummary: `Rescheduled to ${newDueDate} ${newDueTime}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `follow_ups/${followUpId}`);
  }
}

export function subscribeToFollowUps(
  user: UserProfile,
  onUpdate: (followUps: FollowUp[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, 'follow_ups');
  const q = user.role === 'admin'
    ? query(collectionRef)
    : query(collectionRef, where('assignedStaffId', '==', user.uid));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => d.data() as FollowUp);
      items.sort((a, b) => (a.dueDate + (a.dueTime || '')).localeCompare(b.dueDate + (b.dueTime || '')));
      onUpdate(items);
    },
    (err) => {
      onError(err);
      handleFirestoreError(err, OperationType.LIST, 'follow_ups');
    }
  );
}

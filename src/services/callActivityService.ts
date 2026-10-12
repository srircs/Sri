import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CallActivity, Lead, UserProfile, FollowUp } from '../types';
import { logAuditEvent } from './auditService';

export async function logCallActivity(params: {
  lead: Lead;
  staffUser: UserProfile;
  callData: {
    callDateTime: string;
    callOutcome: string;
    customerResponse?: string;
    discussionSummary: string;
    customerRequirement?: string;
    interestLevel?: 'High' | 'Medium' | 'Low' | 'None';
    updatedStatus: string;
    nextFollowUpDate?: string;
    nextAction?: string;
    additionalNotes?: string;
  };
}): Promise<CallActivity> {
  const activityId = 'call_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const activityRecord: CallActivity = {
    id: activityId,
    leadDocId: params.lead.id,
    leadCode: params.lead.leadId,
    companyName: params.lead.companyName,
    contactPerson: params.lead.contactPerson,
    mobileNumber: params.lead.mobileNumber,
    staffId: params.staffUser.uid,
    staffName: params.staffUser.displayName,
    callDateTime: params.callData.callDateTime || now,
    callOutcome: params.callData.callOutcome,
    customerResponse: params.callData.customerResponse || '',
    discussionSummary: params.callData.discussionSummary,
    customerRequirement: params.callData.customerRequirement || '',
    interestLevel: params.callData.interestLevel || 'Medium',
    previousStatus: params.lead.status,
    updatedStatus: params.callData.updatedStatus,
    nextFollowUpDate: params.callData.nextFollowUpDate || '',
    nextAction: params.callData.nextAction || '',
    additionalNotes: params.callData.additionalNotes || '',
    createdAt: now,
  };

  try {
    // 1. Write the permanent call activity record
    await setDoc(doc(db, 'call_activities', activityId), activityRecord);

    // 2. Update the parent lead's fields
    const leadRef = doc(db, 'leads', params.lead.id);
    await updateDoc(leadRef, {
      status: params.callData.updatedStatus,
      lastContactDate: params.callData.callDateTime || now,
      lastCallOutcome: params.callData.callOutcome,
      nextFollowUpDate: params.callData.nextFollowUpDate || '',
      updatedAt: now,
      additionalNotes: params.callData.additionalNotes
        ? `${params.lead.additionalNotes ? params.lead.additionalNotes + '\n' : ''}[${new Date().toLocaleDateString()}]: ${params.callData.additionalNotes}`
        : params.lead.additionalNotes || '',
    });

    // 3. If next follow up is scheduled, create a follow up record
    if (params.callData.nextFollowUpDate) {
      const followUpId = 'fup_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const followUpRecord: FollowUp = {
        id: followUpId,
        leadDocId: params.lead.id,
        leadCode: params.lead.leadId,
        companyName: params.lead.companyName,
        contactPerson: params.lead.contactPerson,
        mobileNumber: params.lead.mobileNumber,
        assignedStaffId: params.lead.assignedStaffId || params.staffUser.uid,
        assignedStaffName: params.lead.assignedStaffName || params.staffUser.displayName,
        dueDate: params.callData.nextFollowUpDate.split('T')[0] || params.callData.nextFollowUpDate,
        dueTime: params.callData.nextFollowUpDate.includes('T') ? params.callData.nextFollowUpDate.split('T')[1]?.substring(0, 5) : '',
        status: 'pending',
        notes: params.callData.nextAction || params.callData.discussionSummary,
        createdAt: now,
      };
      await setDoc(doc(db, 'follow_ups', followUpId), followUpRecord);
    }

    // 4. Audit Log
    await logAuditEvent({
      actorId: params.staffUser.uid,
      actorName: params.staffUser.displayName,
      actorRole: params.staffUser.role,
      action: 'Call Activity Logged',
      targetType: 'Lead',
      targetId: params.lead.id,
      targetSummary: `${params.lead.companyName} (${params.callData.callOutcome})`,
      details: `Status: ${params.lead.status} -> ${params.callData.updatedStatus}. Summary: ${params.callData.discussionSummary.substring(0, 100)}`,
    });

    return activityRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `call_activities/${activityId}`);
    throw error;
  }
}

export function subscribeToLeadCallActivities(
  leadDocId: string,
  onUpdate: (activities: CallActivity[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'call_activities'),
    where('leadDocId', '==', leadDocId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => d.data() as CallActivity);
      items.sort((a, b) => new Date(b.callDateTime).getTime() - new Date(a.callDateTime).getTime());
      onUpdate(items);
    },
    (err) => {
      onError(err);
      handleFirestoreError(err, OperationType.LIST, 'call_activities');
    }
  );
}

export function subscribeToAllCallActivities(
  user: UserProfile,
  onUpdate: (activities: CallActivity[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const collectionRef = collection(db, 'call_activities');
  const q = user.role === 'admin'
    ? query(collectionRef)
    : query(collectionRef, where('staffId', '==', user.uid));

  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(d => d.data() as CallActivity);
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(items);
    },
    (err) => {
      onError(err);
      handleFirestoreError(err, OperationType.LIST, 'call_activities');
    }
  );
}

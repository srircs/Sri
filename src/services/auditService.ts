import { collection, doc, setDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AuditLog } from '../types';

export async function logAuditEvent(params: {
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'staff' | 'system';
  action: string;
  targetType: string;
  targetId: string;
  targetSummary: string;
  details?: string;
}): Promise<void> {
  const auditId = 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const auditData: AuditLog = {
    id: auditId,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    targetSummary: params.targetSummary,
    details: params.details || '',
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'audit_logs', auditId), auditData);
  } catch (error) {
    // We log but do not crash the primary operation if audit fails
    console.error('Failed to write audit log:', error);
  }
}

export async function getAuditLogs(maxCount = 100): Promise<AuditLog[]> {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as AuditLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'audit_logs');
    return [];
  }
}

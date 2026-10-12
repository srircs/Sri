import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { generateSalt, hashPassword } from '../utils/crypto';
import { logAuditEvent } from './auditService';

export async function getAllStaff(): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'staff'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
    return [];
  }
}

export async function getActiveStaff(): Promise<UserProfile[]> {
  try {
    const all = await getAllStaff();
    return all.filter(s => s.isActive);
  } catch (error) {
    return [];
  }
}

export async function createStaffAccount(params: {
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  password: string;
  adminUid: string;
  adminName: string;
}): Promise<UserProfile> {
  const cleanUsername = params.username.trim().toLowerCase();
  
  // Check if username already exists
  const existingQuery = query(collection(db, 'users'), where('username', '==', cleanUsername));
  const existingSnap = await getDocs(existingQuery);
  if (!existingSnap.empty) {
    throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
  }

  const staffUid = 'staff_' + cleanUsername.replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
  const salt = generateSalt();
  const passHash = await hashPassword(params.password, salt);

  const newStaff: UserProfile = {
    uid: staffUid,
    username: cleanUsername,
    displayName: params.displayName.trim(),
    email: params.email.trim().toLowerCase(),
    phone: params.phone?.trim() || '',
    role: 'staff',
    isActive: true,
    passwordHash: passHash,
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', staffUid), newStaff);
    
    await logAuditEvent({
      actorId: params.adminUid,
      actorName: params.adminName,
      actorRole: 'admin',
      action: 'Staff Account Created',
      targetType: 'Staff',
      targetId: staffUid,
      targetSummary: `${newStaff.displayName} (@${newStaff.username})`,
      details: `Created staff profile with email ${newStaff.email}`,
    });

    return newStaff;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${staffUid}`);
    throw error;
  }
}

export async function deactivateStaffAccount(params: {
  staffId: string;
  adminUid: string;
  adminName: string;
  reassignToStaffId?: string;
  reassignToStaffName?: string;
}): Promise<void> {
  try {
    const staffRef = doc(db, 'users', params.staffId);
    const staffSnap = await getDoc(staffRef);
    if (!staffSnap.exists()) {
      throw new Error('Staff member not found.');
    }
    const staffData = staffSnap.data() as UserProfile;

    await updateDoc(staffRef, {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    // Handle lead reassignment if requested
    let reassignedCount = 0;
    const leadsQ = query(collection(db, 'leads'), where('assignedStaffId', '==', params.staffId));
    const leadsSnap = await getDocs(leadsQ);

    if (!leadsSnap.empty) {
      const batch = writeBatch(db);
      leadsSnap.docs.forEach(leadDoc => {
        batch.update(leadDoc.ref, {
          assignedStaffId: params.reassignToStaffId || '',
          assignedStaffName: params.reassignToStaffName || 'Unassigned',
          updatedAt: new Date().toISOString(),
        });
        reassignedCount++;
      });
      await batch.commit();
    }

    await logAuditEvent({
      actorId: params.adminUid,
      actorName: params.adminName,
      actorRole: 'admin',
      action: 'Staff Account Deactivated',
      targetType: 'Staff',
      targetId: params.staffId,
      targetSummary: `${staffData.displayName} (@${staffData.username})`,
      details: `Deactivated staff account. ${reassignedCount} leads reassigned to ${params.reassignToStaffName || 'Unassigned'}.`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${params.staffId}`);
  }
}

export async function reactivateStaffAccount(params: {
  staffId: string;
  adminUid: string;
  adminName: string;
}): Promise<void> {
  try {
    const staffRef = doc(db, 'users', params.staffId);
    const staffSnap = await getDoc(staffRef);
    if (!staffSnap.exists()) throw new Error('Staff not found');
    const staffData = staffSnap.data() as UserProfile;

    await updateDoc(staffRef, {
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    await logAuditEvent({
      actorId: params.adminUid,
      actorName: params.adminName,
      actorRole: 'admin',
      action: 'Staff Account Reactivated',
      targetType: 'Staff',
      targetId: params.staffId,
      targetSummary: `${staffData.displayName} (@${staffData.username})`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${params.staffId}`);
  }
}

export async function resetStaffPassword(params: {
  staffId: string;
  newPassword: string;
  adminUid: string;
  adminName: string;
}): Promise<void> {
  try {
    const salt = generateSalt();
    const hash = await hashPassword(params.newPassword, salt);
    const staffRef = doc(db, 'users', params.staffId);
    
    await updateDoc(staffRef, {
      passwordHash: hash,
      passwordSalt: salt,
      updatedAt: new Date().toISOString(),
    });

    await logAuditEvent({
      actorId: params.adminUid,
      actorName: params.adminName,
      actorRole: 'admin',
      action: 'Staff Password Reset',
      targetType: 'Staff',
      targetId: params.staffId,
      targetSummary: `Password reset by Administrator`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${params.staffId}`);
  }
}

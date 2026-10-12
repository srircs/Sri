import { signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { ADMIN_PRIMARY_EMAIL } from '../utils/constants';
import { verifyPassword, generateSalt, hashPassword } from '../utils/crypto';
import { logAuditEvent } from './auditService';

const SESSION_KEY = 'sri_groups_crm_session';

export interface AuthSession {
  user: UserProfile;
  loginMethod: 'google' | 'credentials';
}

/**
 * Initializes/bootstraps Admin profile for the designated administrator email
 */
export async function ensureAdminRecord(fbUser: FirebaseUser): Promise<UserProfile> {
  const isSuperEmail = fbUser.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase();
  const adminRef = doc(db, 'admins', fbUser.uid);
  const userRef = doc(db, 'users', fbUser.uid);

  const [adminSnap, userSnap] = await Promise.all([
    getDoc(adminRef),
    getDoc(userRef),
  ]);

  const now = new Date().toISOString();

  if (isSuperEmail) {
    if (!adminSnap.exists()) {
      await setDoc(adminRef, {
        uid: fbUser.uid,
        email: fbUser.email,
        role: 'admin',
        createdAt: now,
      });
    }

    const adminProfile: UserProfile = {
      uid: fbUser.uid,
      username: 'admin',
      displayName: fbUser.displayName || 'Administrator (Sri Groups)',
      email: fbUser.email || ADMIN_PRIMARY_EMAIL,
      role: 'admin',
      isActive: true,
      createdAt: userSnap.exists() ? (userSnap.data() as UserProfile).createdAt : now,
      updatedAt: now,
      lastLoginAt: now,
    };

    await setDoc(userRef, adminProfile, { merge: true });
    return adminProfile;
  }

  // If not super admin email, check if exists in users
  if (userSnap.exists()) {
    const existing = userSnap.data() as UserProfile;
    if (!existing.isActive) {
      throw new Error('This account has been deactivated. Contact your administrator.');
    }
    await updateDoc(userRef, { lastLoginAt: now });
    return { ...existing, lastLoginAt: now };
  }

  throw new Error('Access denied. Only registered Sri Groups personnel may access this ERP system.');
}

/**
 * Sign in using Google (Preferred for Admin)
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await ensureAdminRecord(result.user);
    saveLocalSession(profile, 'google');
    return profile;
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign in for Staff members using their individual username and password
 */
export async function signInWithStaffCredentials(username: string, pass: string): Promise<UserProfile> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || !pass) {
    throw new Error('Please enter both username and password.');
  }

  try {
    const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('Invalid username or password.');
    }

    const userDoc = snap.docs[0];
    const user = userDoc.data() as UserProfile;

    if (!user.isActive) {
      throw new Error('Account deactivated. Access to Sri Groups CRM is suspended.');
    }

    if (!user.passwordHash || !user.passwordSalt) {
      throw new Error('Credentials are not configured for this account. Contact Admin.');
    }

    const isValid = await verifyPassword(pass, user.passwordSalt, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password.');
    }

    const now = new Date().toISOString();
    await updateDoc(userDoc.ref, { lastLoginAt: now });
    user.lastLoginAt = now;

    saveLocalSession(user, 'credentials');

    await logAuditEvent({
      actorId: user.uid,
      actorName: user.displayName,
      actorRole: user.role,
      action: 'Staff Signed In',
      targetType: 'Staff',
      targetId: user.uid,
      targetSummary: `@${user.username} authenticated`,
    });

    return user;
  } catch (error) {
    console.error('Staff Login Error:', error);
    throw error;
  }
}

export function saveLocalSession(user: UserProfile, method: 'google' | 'credentials'): void {
  const session: AuthSession = { user, loginMethod: method };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getLocalSession(): AuthSession | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as AuthSession;
  } catch {
    return null;
  }
}

export function clearLocalSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function signOutUser(): Promise<void> {
  clearLocalSession();
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Sign out warning:', err);
  }
}

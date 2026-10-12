import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SystemSettings } from '../types';
import { DEFAULT_LEAD_STATUSES, LEAD_SOURCES } from '../utils/constants';

const SETTINGS_DOC_ID = 'company_settings';

export const INITIAL_SETTINGS: SystemSettings = {
  id: SETTINGS_DOC_ID,
  companyName: 'Sri Groups',
  tagline: 'Enterprise Lead Management & Business Conversion ERP',
  contactPhone: '+91 98765 43210',
  contactEmail: 'contact@srigroups.com',
  statuses: DEFAULT_LEAD_STATUSES,
  sources: LEAD_SOURCES,
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SystemSettings;
    }
    // Return initial settings if not yet saved in cloud
    return INITIAL_SETTINGS;
  } catch (error) {
    // If not readable yet, fallback to default initial settings gracefully
    console.warn('Could not read settings doc, using default initial settings:', error);
    return INITIAL_SETTINGS;
  }
}

export async function saveSystemSettings(settings: SystemSettings, updatedByUid: string): Promise<void> {
  try {
    const docRef = doc(db, 'system_settings', SETTINGS_DOC_ID);
    await setDoc(docRef, {
      ...settings,
      updatedBy: updatedByUid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `system_settings/${SETTINGS_DOC_ID}`);
  }
}

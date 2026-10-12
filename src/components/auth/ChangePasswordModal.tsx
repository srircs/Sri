import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { verifyPassword, generateSalt, hashPassword } from '../../utils/crypto';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { logAuditEvent } from '../../services/auditService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        throw new Error('User record not found.');
      }
      const data = snap.data();

      // If user has existing password, verify current
      if (data.passwordSalt && data.passwordHash) {
        const isValid = await verifyPassword(currentPassword, data.passwordSalt, data.passwordHash);
        if (!isValid) {
          setError('Current password is incorrect.');
          setIsSubmitting(false);
          return;
        }
      }

      // Hash new password
      const newSalt = generateSalt();
      const newHash = await hashPassword(newPassword, newSalt);

      await updateDoc(userRef, {
        passwordSalt: newSalt,
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
      });

      await logAuditEvent({
        actorId: user.uid,
        actorName: user.displayName,
        actorRole: user.role,
        action: 'Password Changed',
        targetType: 'Staff',
        targetId: user.uid,
        targetSummary: 'User updated their personal password',
      });

      showToast('Password updated successfully.', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <span>Change My Password</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">New Password (min 6 chars)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

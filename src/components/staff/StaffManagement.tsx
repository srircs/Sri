import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  KeyRound, 
  ShieldAlert, 
  Search, 
  Phone, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  BarChart2,
  X
} from 'lucide-react';
import { UserProfile, Lead, CallActivity } from '../../types';
import { 
  getAllStaff, 
  createStaffAccount, 
  deactivateStaffAccount, 
  reactivateStaffAccount, 
  resetStaffPassword 
} from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { EmptyState } from '../common/EmptyState';

interface StaffManagementProps {
  leads: Lead[];
  calls: CallActivity[];
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ leads, calls }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<UserProfile | null>(null);
  const [resetPassTarget, setResetPassTarget] = useState<UserProfile | null>(null);

  // Create staff form
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deactivate reassignment
  const [reassignStaffId, setReassignStaffId] = useState('');
  
  // Reset password form
  const [newResetPassword, setNewResetPassword] = useState('');

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStaff();
      setStaffList(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load staff list.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newUsername.trim() || !newDisplayName.trim() || !newPassword) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createStaffAccount({
        username: newUsername.trim(),
        displayName: newDisplayName.trim(),
        email: newEmail.trim() || `${newUsername.trim()}@srigroups.com`,
        phone: newPhone.trim(),
        password: newPassword,
        adminUid: user.uid,
        adminName: user.displayName,
      });

      showToast(`Staff account for "${newDisplayName}" created successfully.`, 'success');
      setIsCreateOpen(false);
      setNewUsername('');
      setNewDisplayName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget || !user) return;
    setIsSubmitting(true);
    const reassignee = staffList.find(s => s.uid === reassignStaffId && s.isActive);

    try {
      await deactivateStaffAccount({
        staffId: deactivateTarget.uid,
        adminUid: user.uid,
        adminName: user.displayName,
        reassignToStaffId: reassignee?.uid,
        reassignToStaffName: reassignee?.displayName,
      });
      showToast(`Account for ${deactivateTarget.displayName} deactivated.`, 'info');
      setDeactivateTarget(null);
      setReassignStaffId('');
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async (target: UserProfile) => {
    if (!user) return;
    try {
      await reactivateStaffAccount({
        staffId: target.uid,
        adminUid: user.uid,
        adminName: user.displayName,
      });
      showToast(`Account for ${target.displayName} reactivated.`, 'success');
      loadStaff();
    } catch (err: any) {
      showToast(err.message || 'Failed to reactivate account.', 'error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassTarget || !user || !newResetPassword) return;
    setIsSubmitting(true);
    try {
      await resetStaffPassword({
        staffId: resetPassTarget.uid,
        newPassword: newResetPassword,
        adminUid: user.uid,
        adminName: user.displayName,
      });
      showToast(`Password updated for ${resetPassTarget.displayName}.`, 'success');
      setResetPassTarget(null);
      setNewResetPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.displayName.toLowerCase().includes(term) || s.username.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Staff Members List */}
      {filteredStaff.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Staff Members Found"
          description={searchTerm ? "No personnel match your search term." : "No sales staff accounts have been created yet."}
          actionText="Add First Staff Member"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const assignedLeads = leads.filter(l => l.assignedStaffId === staff.uid);
            const staffCalls = calls.filter(c => c.staffId === staff.uid);
            const convertedCount = assignedLeads.filter(l => l.status === 'Converted').length;

            return (
              <div
                key={staff.uid}
                className={`bg-white rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between ${
                  staff.isActive ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {staff.displayName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{staff.displayName}</h3>
                        <p className="text-xs text-slate-400 font-mono">@{staff.username}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        staff.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {staff.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 mb-4">
                    {staff.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{staff.email}</span>
                      </div>
                    )}
                    {staff.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{staff.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-center mb-4 text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900">{assignedLeads.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Leads</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-blue-600">{staffCalls.length}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Calls</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-emerald-600">{convertedCount}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Won</div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setResetPassTarget(staff);
                      setNewResetPassword('');
                    }}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md font-semibold transition-colors flex items-center gap-1"
                    title="Reset Staff Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Key</span>
                  </button>

                  {staff.isActive ? (
                    <button
                      onClick={() => {
                        setDeactivateTarget(staff);
                        setReassignStaffId('');
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Deactivate</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReactivate(staff)}
                      className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md font-semibold transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Staff Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-base">Create Staff Account</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. karthik, priya_sales"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Full Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g. Karthik Selvam"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. karthik@srigroups.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Initial Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set secure password for staff"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Staff & Reassign Leads Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Deactivate Staff Account</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating <strong>{deactivateTarget.displayName}</strong> will immediately revoke their ability to sign in and access CRM leads.
            </p>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong className="block mb-1">Lead Reassignment Rule:</strong>
              Choose where to transfer all leads currently assigned to this staff member:
              <select
                value={reassignStaffId}
                onChange={(e) => setReassignStaffId(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 outline-none"
              >
                <option value="">-- Leave as Unassigned --</option>
                {staffList.filter(s => s.uid !== deactivateTarget.uid && s.isActive).map(s => (
                  <option key={s.uid} value={s.uid}>
                    Reassign to: {s.displayName} (@{s.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeactivate}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
              <KeyRound className="w-5 h-5" />
              <span>Reset Password</span>
            </div>

            <p className="text-xs text-slate-600">
              Enter a new secure password for <strong>{resetPassTarget.displayName}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResetPassTarget(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                >
                  {isSubmitting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

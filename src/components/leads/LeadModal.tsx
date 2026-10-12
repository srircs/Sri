import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Tag, 
  AlertTriangle,
  Briefcase,
  Calendar,
  Check
} from 'lucide-react';
import { Lead, LeadPriority, LeadSource, UserProfile } from '../../types';
import { 
  BUSINESS_CATEGORIES, 
  LEAD_SOURCES, 
  DEFAULT_LEAD_STATUSES 
} from '../../utils/constants';
import { checkDuplicateLead, createLead, updateLead } from '../../services/leadsService';
import { getActiveStaff } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
  onSuccess: (lead: Lead) => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  leadToEdit,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [activeStaffList, setActiveStaffList] = useState<UserProfile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Duplicate check alert state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingLead?: Lead;
  } | null>(null);

  // Form Fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [cityArea, setCityArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [leadSource, setLeadSource] = useState<LeadSource>('IndiaMART');
  const [requirement, setRequirement] = useState('');
  const [priority, setPriority] = useState<LeadPriority>('Medium');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [status, setStatus] = useState('New Lead');
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      getActiveStaff().then(setActiveStaffList);
      
      if (leadToEdit) {
        setCompanyName(leadToEdit.companyName);
        setContactPerson(leadToEdit.contactPerson);
        setMobileNumber(leadToEdit.mobileNumber);
        setAlternatePhone(leadToEdit.alternatePhone || '');
        setEmail(leadToEdit.email || '');
        setBusinessCategory(leadToEdit.businessCategory || BUSINESS_CATEGORIES[0]);
        setCityArea(leadToEdit.cityArea || '');
        setFullAddress(leadToEdit.fullAddress || '');
        setWebsite(leadToEdit.website || '');
        setLeadSource(leadToEdit.leadSource);
        setRequirement(leadToEdit.requirement || '');
        setPriority(leadToEdit.priority);
        setAssignedStaffId(leadToEdit.assignedStaffId || '');
        setStatus(leadToEdit.status);
        setAdditionalNotes(leadToEdit.additionalNotes || '');
      } else {
        // Reset form
        setCompanyName('');
        setContactPerson('');
        setMobileNumber('');
        setAlternatePhone('');
        setEmail('');
        setBusinessCategory(BUSINESS_CATEGORIES[0]);
        setCityArea('');
        setFullAddress('');
        setWebsite('');
        setLeadSource('IndiaMART');
        setRequirement('');
        setPriority('Medium');
        setAssignedStaffId('');
        setStatus('New Lead');
        setAdditionalNotes('');
      }
      setDuplicateWarning(null);
    }
  }, [isOpen, leadToEdit]);

  if (!isOpen) return null;

  const handlePhoneBlur = async () => {
    if (mobileNumber.length >= 8) {
      const dup = await checkDuplicateLead(mobileNumber, companyName, leadToEdit?.id);
      if (dup.hasDuplicate) {
        const match = dup.duplicateByPhone || dup.duplicateByName;
        setDuplicateWarning({
          message: `Possible duplicate detected! Lead already exists for "${match?.companyName}" (${match?.leadId}), assigned to ${match?.assignedStaffName || 'Unassigned'}.`,
          existingLead: match,
        });
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, forceCreate = false) => {
    e.preventDefault();
    if (!user) return;

    if (!companyName.trim() || !contactPerson.trim() || !mobileNumber.trim()) {
      showToast('Please fill all required fields (Company, Contact Person, Mobile).', 'error');
      return;
    }

    // Check duplicate if not forced
    if (!leadToEdit && !forceCreate) {
      const dup = await checkDuplicateLead(mobileNumber, companyName);
      if (dup.hasDuplicate) {
        const match = dup.duplicateByPhone || dup.duplicateByName;
        setDuplicateWarning({
          message: `Lead already exists with mobile ${mobileNumber} for "${match?.companyName}" (${match?.leadId}). Do you want to proceed anyway?`,
          existingLead: match,
        });
        return;
      }
    }

    setIsSubmitting(true);
    const assignedStaff = activeStaffList.find(s => s.uid === assignedStaffId);

    try {
      if (leadToEdit) {
        await updateLead({
          leadId: leadToEdit.id,
          updates: {
            companyName: companyName.trim(),
            contactPerson: contactPerson.trim(),
            mobileNumber: mobileNumber.trim(),
            alternatePhone: alternatePhone.trim(),
            email: email.trim(),
            businessCategory,
            cityArea: cityArea.trim(),
            fullAddress: fullAddress.trim(),
            website: website.trim(),
            leadSource,
            requirement: requirement.trim(),
            priority,
            assignedStaffId: assignedStaffId || '',
            assignedStaffName: assignedStaff ? assignedStaff.displayName : 'Unassigned',
            status,
            additionalNotes: additionalNotes.trim(),
          },
          actor: user,
        });
        showToast('Lead details updated successfully.', 'success');
        onSuccess({
          ...leadToEdit,
          companyName,
          contactPerson,
          mobileNumber,
          status,
        });
      } else {
        const newLead = await createLead({
          leadData: {
            companyName: companyName.trim(),
            contactPerson: contactPerson.trim(),
            mobileNumber: mobileNumber.trim(),
            alternatePhone: alternatePhone.trim(),
            email: email.trim(),
            businessCategory,
            cityArea: cityArea.trim(),
            fullAddress: fullAddress.trim(),
            website: website.trim(),
            leadSource,
            requirement: requirement.trim(),
            priority,
            assignedStaffId: assignedStaffId || '',
            assignedStaffName: assignedStaff ? assignedStaff.displayName : 'Unassigned',
            status,
            additionalNotes: additionalNotes.trim(),
          },
          adminUser: user,
        });
        showToast(`Lead created successfully with ID: ${newLead.leadId}`, 'success');
        onSuccess(newLead);
      }
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save lead.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {leadToEdit ? `Edit Lead: ${leadToEdit.leadId}` : 'Add New Enterprise Lead'}
              </h2>
              <p className="text-xs text-slate-400">
                {leadToEdit ? 'Update prospect information' : 'Register prospect into Sri Groups pipeline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 flex-1">
              <p className="font-bold mb-1">Duplicate Lead Warning</p>
              <p>{duplicateWarning.message}</p>
            </div>
            {!leadToEdit && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors shrink-0"
              >
                Proceed Anyway
              </button>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Section 1: Company & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="e.g. Acme Tech Solutions Pvt Ltd"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Primary Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Alternate Phone Number
              </label>
              <input
                type="tel"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="e.g. 044-24567890"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. contact@company.com"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. www.company.com"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section 2: Business & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Lead Source <span className="text-red-500">*</span>
              </label>
              <select
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value as LeadSource)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Business Category
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LeadPriority)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🔵 Low Priority</option>
              </select>
            </div>
          </div>

          {/* Section 3: Assignment & Pipeline Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Assign to Staff Member
              </label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
              >
                <option value="">-- Leave Unassigned --</option>
                {activeStaffList.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.displayName} (@{s.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Lead Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium"
              >
                {DEFAULT_LEAD_STATUSES.map((st) => (
                  <option key={st.name} value={st.name}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Address & Geography */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                City / Area
              </label>
              <input
                type="text"
                value={cityArea}
                onChange={(e) => setCityArea(e.target.value)}
                placeholder="e.g. Coimbatore, Gandhipuram"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Door No, Street, Landmark, Pincode"
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section 5: Requirement & Notes */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Product / Service Requirement
              </label>
              <textarea
                rows={2}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Describe what the prospect needs (quantities, specifications, delivery timeline)..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any special remarks or background context..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{leadToEdit ? 'Save Changes' : 'Create Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

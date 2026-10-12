import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers,
  Palette
} from 'lucide-react';
import { SystemSettings, SystemStatusConfig } from '../../types';
import { getSystemSettings, saveSystemSettings, INITIAL_SETTINGS } from '../../services/settingsService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ADMIN_PRIMARY_EMAIL } from '../../utils/constants';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New status input
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('blue');

  useEffect(() => {
    setIsLoading(true);
    getSystemSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await saveSystemSettings(settings, user.uid);
      showToast('Company settings updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusName.trim() || !user) return;
    const newStatus: SystemStatusConfig = {
      id: 'st_' + Date.now(),
      name: newStatusName.trim(),
      color: newStatusColor,
      order: settings.statuses.length + 1,
    };
    const updated = {
      ...settings,
      statuses: [...settings.statuses, newStatus],
    };
    setSettings(updated);
    setNewStatusName('');
    try {
      await saveSystemSettings(updated, user.uid);
      showToast(`Status "${newStatus.name}" added to pipeline.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save status.', 'error');
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    if (!user) return;
    const updated = {
      ...settings,
      statuses: settings.statuses.filter(s => s.id !== statusId),
    };
    setSettings(updated);
    try {
      await saveSystemSettings(updated, user.uid);
      showToast('Status removed from pipeline.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete status.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Sri Groups Enterprise Settings</h1>
            <p className="text-xs text-slate-500">
              Configure corporate identity, lead statuses pipeline, and role security boundaries
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" /> Role-Based Security Architecture & Rules
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block font-semibold mb-1">Single Admin Guarantee</span>
            <p className="leading-relaxed text-slate-300">
              Only one administrative account is authorized: <span className="text-emerald-400 font-mono font-bold">{ADMIN_PRIMARY_EMAIL}</span>. Public sign-up is blocked.
            </p>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold mb-1">Firestore Access Control</span>
            <p className="leading-relaxed text-slate-300">
              Staff members are restricted by Firestore Security Rules to reading only leads where <span className="text-blue-300 font-mono">assignedStaffId == uid</span>. Staff cannot create or delete leads.
            </p>
          </div>
        </div>
      </div>

      {/* General Company Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Building2 className="w-4 h-4 text-blue-600" /> Company Profile & Branding
        </h2>

        <form onSubmit={handleSaveGeneral} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Subheading / Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Support Phone</label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Official Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Company Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Configurable Lead Statuses Pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Configurable Lead Status Pipeline</h2>
          </div>
          <span className="text-xs text-slate-400">Total {settings.statuses.length} stages</span>
        </div>

        {/* Existing Statuses List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {settings.statuses.map((st, idx) => (
            <div
              key={st.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/60"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-400 w-4">{idx + 1}.</span>
                <span className="font-bold text-slate-800">{st.name}</span>
                {st.isTerminal && (
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded">
                    Terminal
                  </span>
                )}
              </div>

              {settings.statuses.length > 5 && !st.isTerminal && (
                <button
                  onClick={() => handleDeleteStatus(st.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove status stage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Status */}
        <div className="pt-3 border-t border-slate-100">
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Add New Pipeline Stage
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newStatusName}
              onChange={(e) => setNewStatusName(e.target.value)}
              placeholder="e.g. Contract Drafting, Site Survey Done..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddStatus}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

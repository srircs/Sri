import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ADMIN_PRIMARY_EMAIL } from '../../utils/constants';
import { SriLogo } from '../common/SriLogo';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, loginWithStaffCredentials, isLoading, error, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'staff' | 'admin'>('staff');

  // Staff Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    clearError();

    if (!username.trim() || !password) {
      setLocalErr('Please enter both username and password.');
      return;
    }

    try {
      await loginWithStaffCredentials(username.trim(), password);
    } catch (err: any) {
      setLocalErr(err.message || 'Invalid username or password.');
    }
  };

  const handleGoogleAdmin = async () => {
    setLocalErr(null);
    clearError();
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLocalErr(err.message || 'Failed to authenticate via Google.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background glowing accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-3">
            <SriLogo size="xl" showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sri Groups
          </h1>
          <p className="text-sm font-semibold text-teal-400 mt-1 uppercase tracking-widest text-[11px]">
            Enterprise ERP & CRM Pipeline
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Lead Management, Sales Activities & Conversion System
          </p>
        </div>

        {/* Tab switch: Staff vs Admin */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 flex mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('staff'); setLocalErr(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff Portal
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setLocalErr(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin Sign-In
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {(error || localErr) && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error || localErr}</span>
            </div>
          )}

          {activeTab === 'staff' ? (
            /* Staff Username & Password Form */
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Staff Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. karthik, priya"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter staff password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white text-sm outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Staff Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Staff accounts are issued and managed by the Administrator. If you do not have credentials, contact your Admin.
                </p>
              </div>
            </form>
          ) : (
            /* Admin Google Sign-In Tab */
            <div className="space-y-4 text-center">
              <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-left">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" /> Single Admin Authority
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Authorized Administrator account (<span className="text-indigo-300 font-mono font-semibold">{ADMIN_PRIMARY_EMAIL}</span>).
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleAdmin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 disabled:bg-slate-300 text-slate-900 font-bold rounded-xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Authenticate as Administrator</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Security watermark footer */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Sri Groups. Protected by Cloud Firestore ABAC & Rules.</p>
        </div>
      </div>
    </div>
  );
};

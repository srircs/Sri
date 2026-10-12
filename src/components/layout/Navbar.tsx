import { 
  Building2, 
  LogOut, 
  User, 
  ShieldCheck, 
  Menu, 
  X,
  PhoneCall,
  CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SriLogo } from '../common/SriLogo';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen, activeView }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <SriLogo size="md" showText={true} />
            <p className="text-[11px] text-slate-400 hidden lg:block ml-2 pl-2 border-l border-slate-750">
              Sales & Lead Conversion Management
            </p>
          </div>
        </div>

        {/* Right: User Status, Role Badge & Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5 pl-3 py-1 pr-1 bg-slate-800/80 rounded-full border border-slate-750">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                  {isAdmin ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> System Admin
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">
                      Sales Staff (@{user.username})
                    </span>
                  )}
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200">
                <User className="w-4 h-4" />
              </div>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

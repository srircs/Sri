import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  CalendarClock, 
  PhoneCall, 
  UserCheck, 
  BarChart3, 
  History, 
  Settings, 
  LogOut,
  ClockAlert,
  KeyRound,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SriLogo } from '../common/SriLogo';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenAddLeadModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onOpenAddLeadModal,
}) => {
  const { user, isAdmin, logout } = useAuth();

  const handleNav = (view: string) => {
    if (view === 'add-lead') {
      if (onOpenAddLeadModal) {
        onOpenAddLeadModal();
      }
    } else {
      onNavigate(view);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all-leads', label: 'All Leads', icon: Users },
    { id: 'add-lead', label: 'Add Lead', icon: UserPlus, isAction: true },
    { id: 'follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { id: 'call-activities', label: 'Call Activities', icon: PhoneCall },
    { id: 'staff-management', label: 'Staff Management', icon: UserCheck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'audit-history', label: 'Audit History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const staffNavItems = [
    { id: 'staff-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'my-leads', label: 'My Leads', icon: Users },
    { id: 'today-followups', label: "Today's Follow-ups", icon: CalendarClock },
    { id: 'overdue-followups', label: 'Overdue Follow-ups', icon: ClockAlert },
    { id: 'my-call-history', label: 'Call History', icon: PhoneCall },
    { id: 'my-performance', label: 'My Performance', icon: TrendingUp },
    { id: 'change-password', label: 'Change Password', icon: KeyRound },
  ];

  const navItems = isAdmin ? adminNavItems : staffNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 h-[100dvh] md:h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
          {/* Role header in mobile sidebar */}
          <div className="px-3 pb-3 mb-2 border-b border-slate-800 md:hidden space-y-2">
            <SriLogo size="sm" showText={true} />
            <div className="pt-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">
                {isAdmin ? 'Admin Console' : 'Staff Workspace'}
              </span>
              <div className="text-xs font-bold text-white truncate">{user?.displayName}</div>
            </div>
          </div>

          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.id === 'add-lead' && (
                  <span className="ml-auto text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  PhoneCall, 
  MoreHorizontal,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAddLeadModal?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenMobileMenu,
  onOpenAddLeadModal,
}) => {
  const { isAdmin } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        <button
          onClick={() => onNavigate(isAdmin ? 'dashboard' : 'staff-dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView.includes('dashboard') ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate(isAdmin ? 'all-leads' : 'my-leads')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView.includes('lead') ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Leads</span>
        </button>

        {isAdmin ? (
          <button
            onClick={onOpenAddLeadModal}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 border-2 border-slate-900">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-blue-400 font-bold mt-1">Add Lead</span>
          </button>
        ) : null}

        <button
          onClick={() => onNavigate(isAdmin ? 'follow-ups' : 'today-followups')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView.includes('follow') ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CalendarClock className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Follow-ups</span>
        </button>

        <button
          onClick={() => onNavigate(isAdmin ? 'call-activities' : 'my-call-history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeView.includes('call') ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Calls</span>
        </button>

        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400"
        >
          <MoreHorizontal className="w-5 h-5 mb-1" />
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </div>
  );
};

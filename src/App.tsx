import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
import { LeadsTable } from './components/leads/LeadsTable';
import { LeadModal } from './components/leads/LeadModal';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { CallUpdateModal } from './components/calls/CallUpdateModal';
import { FollowUpManager } from './components/followups/FollowUpManager';
import { StaffManagement } from './components/staff/StaffManagement';
import { ReportsView } from './components/reports/ReportsView';
import { AuditHistoryView } from './components/audit/AuditHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { CallActivitiesView } from './components/calls/CallActivitiesView';
import { StaffPerformanceView } from './components/staff/StaffPerformanceView';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { Lead, CallActivity, FollowUp, UserProfile } from './types';
import { subscribeToLeads } from './services/leadsService';
import { subscribeToAllCallActivities } from './services/callActivityService';
import { subscribeToFollowUps } from './services/followUpService';
import { getAllStaff } from './services/staffService';
import { seedInitialSriGroupsData } from './services/seedService';
import { Sparkles, Database } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, isLoading, isAdmin, isStaff } = useAuth();
  const { showToast } = useNotification();

  // Active view state
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // Data states
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<CallActivity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);
  
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Adjust default view upon login based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveView('dashboard');
      } else {
        setActiveView('staff-dashboard');
      }
    }
  }, [user?.role]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!user) return;

    // 1. Leads
    const unsubLeads = subscribeToLeads(
      user,
      (updatedLeads) => {
        setLeads(updatedLeads);
        // keep selectedLeadForDetail fresh if open
        setSelectedLeadForDetail(curr => {
          if (!curr) return null;
          return updatedLeads.find(l => l.id === curr.id) || curr;
        });
      },
      (err) => console.error('Leads subscription error:', err)
    );

    // 2. Call Activities
    const unsubCalls = subscribeToAllCallActivities(
      user,
      setCalls,
      (err) => console.error('Calls subscription error:', err)
    );

    // 3. Follow-ups
    const unsubFollowUps = subscribeToFollowUps(
      user,
      setFollowUps,
      (err) => console.error('Follow-ups subscription error:', err)
    );

    // 4. Staff list (if Admin)
    if (user.role === 'admin') {
      getAllStaff().then(setStaffList).catch(console.error);
    }

    return () => {
      unsubLeads();
      unsubCalls();
      unsubFollowUps();
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
          Loading Sri Groups ERP...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleOpenAddLead = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleOpenCallUpdate = (lead: Lead) => {
    setSelectedLeadForCall(lead);
  };

  const handleSeedDemoData = async () => {
    if (!isAdmin || isSeeding) return;
    setIsSeeding(true);
    try {
      await seedInitialSriGroupsData(user);
      showToast('Sample Sri Groups enterprise leads & staff seeded successfully!', 'success');
      getAllStaff().then(setStaffList);
    } catch (err: any) {
      showToast(err.message || 'Failed to seed demo data.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans pb-16 md:pb-0">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        isSidebarOpen={isSidebarOpenMobile}
        activeView={activeView}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            if (view === 'change-password') {
              setIsChangePasswordOpen(true);
            } else {
              setActiveView(view);
            }
          }}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          onOpenAddLeadModal={handleOpenAddLead}
        />

        {/* Content Canvas */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Quick Seed helper banner for Admin if database is empty */}
          {isAdmin && leads.length === 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md border border-blue-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-blue-200">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Welcome to Sri Groups ERP & CRM</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your Firestore database is active. You can add new leads manually or load initial sample leads and staff accounts to explore the dashboard immediately.
                </p>
              </div>

              <button
                onClick={handleSeedDemoData}
                disabled={isSeeding}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Seeding Data...' : 'Load Sample Leads'}</span>
              </button>
            </div>
          )}

          {/* ADMIN VIEWS */}
          {isAdmin && (
            <>
              {activeView === 'dashboard' && (
                <AdminDashboard
                  leads={leads}
                  calls={calls}
                  followUps={followUps}
                  staffList={staffList}
                  onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onNavigate={setActiveView}
                  onOpenAddLeadModal={handleOpenAddLead}
                />
              )}

              {activeView === 'all-leads' && (
                <LeadsTable
                  leads={leads}
                  onOpenDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                  staffList={staffList}
                  isAdmin={true}
                  onOpenAddModal={handleOpenAddLead}
                />
              )}

              {activeView === 'follow-ups' && (
                <FollowUpManager
                  followUps={followUps}
                  leads={leads}
                  onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                />
              )}

              {activeView === 'call-activities' && (
                <CallActivitiesView
                  calls={calls}
                  staffList={staffList}
                  isAdmin={true}
                />
              )}

              {activeView === 'staff-management' && (
                <StaffManagement leads={leads} calls={calls} />
              )}

              {activeView === 'reports' && (
                <ReportsView
                  leads={leads}
                  calls={calls}
                  followUps={followUps}
                  staffList={staffList}
                />
              )}

              {activeView === 'audit-history' && <AuditHistoryView />}

              {activeView === 'settings' && <SettingsView />}
            </>
          )}

          {/* STAFF VIEWS */}
          {isStaff && (
            <>
              {activeView === 'staff-dashboard' && (
                <StaffDashboard
                  myLeads={leads}
                  myCalls={calls}
                  myFollowUps={followUps}
                  currentUser={user}
                  onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                  onNavigate={setActiveView}
                />
              )}

              {activeView === 'my-leads' && (
                <LeadsTable
                  leads={leads}
                  onOpenDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                  isAdmin={false}
                />
              )}

              {activeView === 'today-followups' && (
                <FollowUpManager
                  followUps={followUps}
                  leads={leads}
                  onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                  initialTab="today"
                />
              )}

              {activeView === 'overdue-followups' && (
                <FollowUpManager
                  followUps={followUps}
                  leads={leads}
                  onOpenLeadDetail={(lead) => setSelectedLeadForDetail(lead)}
                  onUpdateCall={handleOpenCallUpdate}
                  initialTab="overdue"
                />
              )}

              {activeView === 'my-call-history' && (
                <CallActivitiesView
                  calls={calls}
                  isAdmin={false}
                />
              )}

              {activeView === 'my-performance' && (
                <StaffPerformanceView
                  myLeads={leads}
                  myCalls={calls}
                  myFollowUps={followUps}
                  currentUser={user}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenMobileMenu={() => setIsSidebarOpenMobile(true)}
        onOpenAddLeadModal={isAdmin ? handleOpenAddLead : undefined}
      />

      {/* MODALS */}
      {/* 1. Add / Edit Lead Modal (Admin) */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        leadToEdit={leadToEdit}
        onSuccess={(savedLead) => {
          setSelectedLeadForDetail(savedLead);
        }}
      />

      {/* 2. Full Lead Detail Modal */}
      <LeadDetailModal
        isOpen={Boolean(selectedLeadForDetail)}
        onClose={() => setSelectedLeadForDetail(null)}
        lead={selectedLeadForDetail}
        onUpdateCall={(lead) => {
          setSelectedLeadForCall(lead);
        }}
        onEditLead={(lead) => {
          setSelectedLeadForDetail(null);
          handleEditLead(lead);
        }}
        onDeleteSuccess={() => {
          setSelectedLeadForDetail(null);
        }}
      />

      {/* 3. Call Update Modal */}
      <CallUpdateModal
        isOpen={Boolean(selectedLeadForCall)}
        onClose={() => setSelectedLeadForCall(null)}
        lead={selectedLeadForCall}
        onSuccess={() => {
          // Handled via real-time subscription
        }}
      />

      {/* 4. Change Password Modal (Staff) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

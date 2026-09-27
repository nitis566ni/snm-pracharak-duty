/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { TopHeader } from './components/layout/TopHeader';
import { RightPanel } from './components/layout/RightPanel';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { OutlookDutyCalendar } from './components/scheduling/OutlookDutyCalendar';
import { MonthlyDutyCalendar } from './components/scheduling/MonthlyDutyCalendar';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { PublishView } from './components/publish/PublishView';
import { MastersManagement } from './components/masters/MastersManagement';
import { DutyReportsView } from './components/reports/DutyReportsView';
import { BulkUploadView } from './components/bulkupload/BulkUploadView';
import { UsersView } from './components/users/UsersView';
import { SettingsAndAuditView } from './components/settings/SettingsAndAuditView';
import { HistoryView } from './components/history/HistoryView';
import { Menu, X, Sparkles, UserCheck } from 'lucide-react';
import { THEME_CONFIGS } from './utils/themeConfig';

const MainAppContent: React.FC = () => {
  const { activeTab, isRightDrawerOpen, setIsRightDrawerOpen, isZoneAdmin, theme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.mint;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'calendar':
        return <OutlookDutyCalendar />;
      case 'masters':
        return isZoneAdmin ? <MastersManagement /> : <DashboardOverview />;
      case 'reports':
        return <DutyReportsView />;
      case 'settings':
        return <SettingsAndAuditView />;
      // Fallbacks
      case 'attendance':
        return <AttendanceView />;
      case 'approvals':
        return isZoneAdmin ? <ApprovalsView /> : <DashboardOverview />;
      case 'publish':
        return isZoneAdmin ? <PublishView /> : <DashboardOverview />;
      case 'bulk_upload':
        return isZoneAdmin ? <BulkUploadView /> : <DashboardOverview />;
      case 'users':
        return isZoneAdmin ? <UsersView /> : <DashboardOverview />;
      case 'history':
        return isZoneAdmin ? <HistoryView /> : <DashboardOverview />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${themeConfig.bgMain} ${themeConfig.textPrimary} transition-colors duration-200`}
    >
      {/* Desktop Left Dock */}
      <div className="hidden sm:flex shrink-0">
        <SidebarNav />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 sm:hidden flex">
          <div className="w-64 bg-white h-full shadow-2xl flex flex-col justify-between py-6 px-4">
            <SidebarNav />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 py-2 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
            >
              Close Menu
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Center Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top strip with hamburger button */}
        <div className="sm:hidden h-14 bg-white px-4 border-b border-[#E2EFEB] flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-[#F0F7F5] text-[#0F4C42]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-xs text-[#0A3A33]">
            Sant Nirankari Mission · Zone 34
          </span>
          <button
            onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
            className="p-2 rounded-xl bg-[#0F3B38] text-white"
          >
            <UserCheck className="w-4 h-4 text-[#D4F58C]" />
          </button>
        </div>

        {/* Desktop / Tablet Top Header */}
        <TopHeader />

        {/* Scrollable Main Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scroll-smooth">
          {renderActiveView()}
        </main>
      </div>

      {/* Right Drawer (Collapsible & Theme-styled as in user image) */}
      <div className={`${isRightDrawerOpen ? 'flex' : 'hidden'} lg:flex shrink-0 h-full`}>
        <RightPanel />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

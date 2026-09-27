import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Upload,
  Settings,
  Shield,
  Layers,
  Sparkles,
  UserCheck,
  Lock,
  Users,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SidebarNav: React.FC = () => {
  const { activeTab, setActiveTab, t, dutyAllocations, isZoneAdmin } = useApp();

  const pendingApprovalsCount = dutyAllocations.filter((d) => d.approvalStatus === 'PENDING').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'calendar',
      label: 'Duty Calendar (Outlook)',
      icon: CalendarDays,
    },
    ...(isZoneAdmin
      ? [
          {
            id: 'masters',
            label: 'Master Directory & Imports',
            icon: Database,
          },
        ]
      : []),
    {
      id: 'reports',
      label: 'Reports & History',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings',
      label: 'Rules, Themes & Font',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-16 md:w-20 bg-white border-r border-[#E2EFEB] flex flex-col items-center py-5 justify-between shrink-0 select-none z-30 transition-all duration-200">
      {/* Brand Icon / Logo */}
      <div className="flex flex-col items-center gap-5 w-full">
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Sant Nirankari Mission - Zone 34 Pune"
          className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F4C42] to-[#2B8274] flex items-center justify-center text-white shadow-sm hover:opacity-95 transition-transform active:scale-95 group relative"
        >
          {/* Universal Peace & Unity Emblem */}
          <svg className="w-6 h-6 text-[#D4F58C]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="absolute left-16 bg-[#0F3B38] text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
            Sant Nirankari Mission · Zone 34
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-2 overflow-y-auto max-h-[calc(100vh-140px)] py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group shrink-0 ${
                  isActive
                    ? 'bg-[#E3F8AC] text-[#0A3A33] shadow-2xs font-semibold'
                    : 'text-[#4A726B] hover:text-[#0F4C42] hover:bg-[#F0F7F5]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />

                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-2xs">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip */}
                <span className="absolute left-16 bg-[#0F3B38] text-white text-xs px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </span>

                {/* Subtle active indicator pill */}
                {isActive && (
                  <span className="absolute -left-2 w-1 h-5 bg-[#0F4C42] rounded-r-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mission Motto Icon */}
      <div className="flex flex-col items-center gap-1 shrink-0 pt-2 border-t border-[#E2EFEB] w-full">
        <div
          title="Dhan Nirankar Ji"
          className="w-8 h-8 rounded-full bg-[#EBF7F4] text-[#0F4C42] flex items-center justify-center text-xs font-bold cursor-default border border-[#CDEAE3]"
        >
          ३४
        </div>
      </div>
    </aside>
  );
};

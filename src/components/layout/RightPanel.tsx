import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MapPin,
  Clock,
  Shield,
  Building,
  CheckCircle,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RightPanel: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    isZoneAdmin,
    userBranch,
    isRightDrawerOpen,
    setIsRightDrawerOpen,
    t,
    isMonthFrozen,
    selectedMonth,
    selectedYear,
    freezeCurrentMonth,
    unfreezeCurrentMonth,
    dutyAllocations,
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  // Month stats for this user
  const monthlyDuties = dutyAllocations.filter((d) => {
    const dt = new Date(d.date);
    return dt.getFullYear() === selectedYear && dt.getMonth() + 1 === selectedMonth;
  });

  const allocatedCount = monthlyDuties.filter((d) => d.type !== 'unfilled').length;
  const userBranchDuties = isZoneAdmin
    ? monthlyDuties
    : monthlyDuties.filter((d) => d.branchId === currentUser.branchId);

  if (!isRightDrawerOpen) {
    return (
      <div className="fixed right-3 top-20 z-20 hidden lg:block">
        <button
          onClick={() => setIsRightDrawerOpen(true)}
          className="w-8 h-8 rounded-full bg-[#0F3B38] text-white flex items-center justify-center shadow-lg hover:bg-[#154E4A] transition-all"
          title="Expand Details Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 xl:w-80 bg-gradient-to-b from-[#0F3B38] via-[#0E3532] to-[#082220] text-white flex flex-col justify-between shrink-0 relative overflow-hidden select-none border-l border-[#19534E] shadow-2xl transition-all duration-300">
      {/* Starry subtle ambient dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,245,140,0.06),_transparent_70%)] pointer-events-none" />

      {/* Top Header Controls */}
      <div className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setIsRightDrawerOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4F58C] animate-pulse" />
            <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-200/80">
              Zone 34 Live
            </span>
          </div>
        </div>

        {/* User Profile Card (Matching screenshot) */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#D4F58C] to-emerald-300 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#0F3B38] flex items-center justify-center overflow-hidden">
                <span className="text-2xl font-bold text-[#D4F58C]">
                  {currentUser.name.charAt(currentUser.name.indexOf('.') > -1 ? currentUser.name.indexOf('.') + 2 : 0)}
                </span>
              </div>
            </div>
            <span className="absolute bottom-0 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0F3B38]" />
          </div>

          <h2 className="text-base font-bold text-white tracking-wide">
            {currentUser.name}
          </h2>
          <p className="text-xs text-emerald-200/70 mt-0.5 font-medium">
            {currentUser.title || (isZoneAdmin ? 'Zone Coordinator' : 'Branch Mukhi')}
          </p>

          {/* Role Switcher Button */}
          <div className="relative w-full mt-4">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="w-full py-2 px-3 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center justify-center gap-2 border border-white/15 transition-all shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('switchRole')}</span>
            </button>

            {/* Quick Switch Dropdown */}
            {isRoleMenuOpen && (
              <div className="absolute top-11 left-0 right-0 bg-[#0B2A28] border border-white/20 rounded-xl p-2 z-50 shadow-xl backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold px-2 py-1">
                  Simulate Account & Branch:
                </p>
                <div className="flex flex-col gap-1 mt-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-[#E3F8AC] text-[#0A3A33] font-bold'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="text-[10px] opacity-75 truncate">{u.title}</p>
                      </div>
                      {u.role === 'ZONE_ADMIN' ? (
                        <Shield className="w-3 h-3 text-amber-300 shrink-0 ml-1" />
                      ) : (
                        <Building className="w-3 h-3 text-emerald-300 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Working / Satsang Timings Widget (from screenshot) */}
        <div className="mt-6">
          <p className="text-[11px] font-medium text-emerald-200/70 mb-2">
            {t('workingHours')}:
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex items-center justify-between">
            <div className="flex-1 bg-white/90 text-[#0F3B38] rounded-xl py-2 px-3 text-center">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Morning
              </span>
              <span className="text-xs font-extrabold font-mono tabular-nums">
                08:30 am
              </span>
            </div>
            <div className="flex-1 text-white py-2 px-3 text-center">
              <span className="block text-[10px] font-semibold text-emerald-200/70 uppercase tracking-wider">
                Evening
              </span>
              <span className="text-xs font-bold font-mono tabular-nums text-white">
                05:30 pm
              </span>
            </div>
          </div>
        </div>

        {/* Publishing / Freeze Quick Action for Zone Admin */}
        {isZoneAdmin && (
          <div className="mt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                  {isMonthFrozen ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      Month Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                      Month Open
                    </>
                  )}
                </span>
                <span className="text-[11px] text-emerald-200/60 font-mono">
                  {selectedYear}-{String(selectedMonth).padStart(2, '0')}
                </span>
              </div>

              {isMonthFrozen ? (
                <button
                  onClick={unfreezeCurrentMonth}
                  className="w-full py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-amber-200 font-medium transition-colors"
                >
                  {t('unfreezeMonth')}
                </button>
              ) : (
                <button
                  onClick={freezeCurrentMonth}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#D4F58C] hover:bg-[#c3e878] text-[#0A3A33] font-bold text-xs transition-colors shadow-xs"
                >
                  {t('freezeMonth')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Branch Scope Reminder for Mukhi */}
        {!isZoneAdmin && userBranch && (
          <div className="mt-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-3 text-xs">
            <p className="text-[11px] text-emerald-300 font-semibold mb-1">
              {t('restrictedBranch')}:
            </p>
            <p className="font-bold text-white">{userBranch.name}</p>
            <p className="text-[10px] text-emerald-200/70 mt-0.5">{userBranch.satsangBhavan}</p>
          </div>
        )}
      </div>

      {/* Bottom Zone & Serene Nature Landscape (Matching Screenshot) */}
      <div className="relative mt-auto">
        {/* City / Zone Header */}
        <div className="px-6 py-3 relative z-10">
          <h3 className="text-lg font-bold text-white tracking-wide">
            Zone 34, Pune
          </h3>
          <p className="text-xs text-emerald-200/80 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#D4F58C]" />
            <span>Maharashtra, India • GMT+5:30</span>
          </p>
        </div>

        {/* Landscape Image with Serene Hills and Water */}
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src="/src/assets/images/pune_serene_nature_1790504970790.jpg"
            alt="Serene Pune Western Ghats Landscape"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-bottom opacity-85 contrast-110"
          />
          {/* Subtle gradient overlay seamlessly blending into the top dark background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#082220]/90 via-transparent to-[#0E3532]" />
        </div>
      </div>
    </aside>
  );
};

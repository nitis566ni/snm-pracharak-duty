import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Video,
  AlertCircle,
  Building,
  Users,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserX,
  FileSpreadsheet,
  Lock,
  Unlock,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Phone,
  Shield,
  Layers,
  Award,
  CalendarDays,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DutyAllocation, DutyType, Pracharak, Branch } from '../../types';
import { AutoAllocateModal } from '../scheduling/AutoAllocateModal';
import { AttendanceFeedbackModal } from '../attendance/AttendanceFeedbackModal';
import { THEME_CONFIGS } from '../../utils/themeConfig';

export const DashboardOverview: React.FC = () => {
  const {
    t,
    lang,
    branches,
    sectors,
    pracharaks,
    holds,
    specialDays,
    dutyAllocations,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
    isZoneAdmin,
    currentUser,
    userBranch,
    isMonthFrozen,
    currentMonthFreeze,
    freezeCurrentMonth,
    unfreezeCurrentMonth,
    approveDuty,
    rejectDuty,
    approveAllPending,
    getSatsangDatesForMonth,
    theme,
  } = useApp();

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.mint;

  // Selected Sector Filter for Dashboard
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [selectedDutyForAttendance, setSelectedDutyForAttendance] = useState<DutyAllocation | null>(null);

  // Quick month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filtered branches based on sector or user role
  const activeBranches = useMemo(() => {
    if (!isZoneAdmin && currentUser.branchId) {
      return branches.filter((b) => b.id === currentUser.branchId);
    }
    if (selectedSectorId === 'all') {
      return branches;
    }
    return branches.filter((b) => b.sectorId === selectedSectorId);
  }, [branches, selectedSectorId, isZoneAdmin, currentUser]);

  const activeBranchIds = useMemo(() => new Set(activeBranches.map((b) => b.id)), [activeBranches]);

  // All slots in month for active branches
  const allMonthSlots = useMemo(() => {
    return getSatsangDatesForMonth(
      selectedYear,
      selectedMonth,
      !isZoneAdmin && currentUser.branchId ? currentUser.branchId : undefined
    ).filter((s) => activeBranchIds.has(s.branch.id));
  }, [selectedYear, selectedMonth, isZoneAdmin, currentUser, activeBranchIds, getSatsangDatesForMonth]);

  // Month duties scoped to filtered branches
  const monthDuties = useMemo(() => {
    return dutyAllocations.filter((d) => {
      const dt = new Date(d.date);
      const isCurrentMonth = dt.getFullYear() === selectedYear && dt.getMonth() + 1 === selectedMonth;
      return isCurrentMonth && activeBranchIds.has(d.branchId);
    });
  }, [dutyAllocations, selectedYear, selectedMonth, activeBranchIds]);

  // KPI Calculations
  const totalCongregations = allMonthSlots.length;
  const regularDuties = monthDuties.filter((d) => d.type === 'pracharak').length;
  const vicharDuties = monthDuties.filter((d) => d.type === 'vichar').length;
  const localDuties = monthDuties.filter((d) => d.type === 'local').length;
  const otherZoneDuties = monthDuties.filter((d) => d.type === 'other_zone').length;
  const filledDuties = regularDuties + vicharDuties + localDuties + otherZoneDuties;
  const unfilledSlots = Math.max(0, totalCongregations - filledDuties);

  const coveragePercent = totalCongregations > 0 ? Math.round((filledDuties / totalCongregations) * 100) : 0;

  // Attendance metrics
  const evaluatedDuties = monthDuties.filter((d) => d.attendance);
  const presentCount = monthDuties.filter((d) => d.attendance === 'PRESENT').length;
  const absentOrSubstitutedCount = monthDuties.filter((d) => d.attendance === 'ABSENT').length;
  const attendanceRate =
    evaluatedDuties.length > 0 ? Math.round((presentCount / evaluatedDuties.length) * 100) : 100;

  // Approvals & Action Items
  const pendingApprovals = useMemo(() => {
    return monthDuties.filter((d) => d.approvalStatus === 'PENDING');
  }, [monthDuties]);

  // Active Preacher Deployment
  const pracharakDutyCounts = useMemo(() => {
    const map = new Map<string, number>();
    monthDuties.forEach((d) => {
      if (d.pracharakId) {
        map.set(d.pracharakId, (map.get(d.pracharakId) || 0) + 1);
      }
    });
    return map;
  }, [monthDuties]);

  const activePreachersCount = pracharakDutyCounts.size;
  const eligiblePreachersTotal = pracharaks.filter((p) => p.active && p.dutyStatus === 'ELIGIBLE').length;

  // Workload histogram (1 duty, 2 duties, 3 duties, 4 duties max)
  const workloadStats = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, more: 0 };
    pracharakDutyCounts.forEach((val) => {
      if (val === 1) counts[1]++;
      else if (val === 2) counts[2]++;
      else if (val === 3) counts[3]++;
      else if (val === 4) counts[4]++;
      else counts.more++;
    });
    return counts;
  }, [pracharakDutyCounts]);

  // Top deployed preachers
  const topDeployedPreachers = useMemo(() => {
    return pracharaks
      .map((p) => ({
        pracharak: p,
        count: pracharakDutyCounts.get(p.id) || 0,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [pracharaks, pracharakDutyCounts]);

  // Preachers on active hold during this month
  const activeMonthHolds = useMemo(() => {
    const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
    return holds.filter((h) => {
      return h.fromDate <= monthEnd && h.toDate >= monthStart;
    });
  }, [holds, selectedYear, selectedMonth]);

  // Upcoming Congregations Agenda (Sorted chronological)
  const upcomingSlots = useMemo(() => {
    const sorted = [...allMonthSlots].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(0, 7);
  }, [allMonthSlots]);

  // Next upcoming event details
  const nextUpcomingEvent = upcomingSlots[0] || null;

  // Pending breakdown
  const localPendingCount = useMemo(
    () => pendingApprovals.filter((d) => d.type === 'local').length,
    [pendingApprovals]
  );
  const otherZonePendingCount = useMemo(
    () => pendingApprovals.filter((d) => d.type === 'other_zone').length,
    [pendingApprovals]
  );
  const pendingBranchesCount = useMemo(
    () => new Set(pendingApprovals.map((d) => d.branchId)).size,
    [pendingApprovals]
  );

  // Special days in this month
  const monthSpecialDays = useMemo(() => {
    const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
    const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-31`;
    return specialDays.filter((s) => {
      return s.active && s.startDate <= monthEnd && s.endDate >= monthStart;
    });
  }, [specialDays, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE MISSION HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#E2EFEB] shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-[#0F4C42] bg-[#E3F8AC] px-2.5 py-0.5 rounded-full">
              Dhan Nirankar Ji
            </span>
            <span className="text-xs text-[#719B93]">·</span>
            <span className="text-xs font-medium text-[#4A726B]">
              Sant Nirankari Mandal · Zone 34 (Pune Region)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0A3A33] tracking-tight mt-1">
            Executive Mission Command
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            {isZoneAdmin
              ? `Zone Administrator View · Overseeing ${branches.length} Bhavans & Branches across Pune, Pimpri-Chinchwad & Dehu`
              : `Branch Mukhi View · ${userBranch?.name} (${userBranch?.code}) · Bhavana Coordinator`}
          </p>
        </div>

        {/* Month Navigation & Global Action Center */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Stepper Selector */}
          <div className="flex items-center bg-[#F0F7F5] border border-[#D5E8E3] rounded-2xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-white text-[#0A3A33] rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-center min-w-[130px]">
              <span className="text-xs font-bold text-[#0A3A33] block leading-tight">
                {monthName}
              </span>
              <span className="text-[10px] text-[#719B93]">
                {isMonthFrozen ? 'Published & Locked' : 'Draft / Editing'}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-white text-[#0A3A33] rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Freeze / Publish Toggle */}
          {isZoneAdmin && (
            <button
              onClick={() => {
                if (isMonthFrozen) {
                  unfreezeCurrentMonth();
                } else {
                  freezeCurrentMonth();
                }
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl border flex items-center gap-2 transition-all shadow-2xs ${
                isMonthFrozen
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-[#D5E8E3]'
              }`}
            >
              {isMonthFrozen ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Unfreeze Month</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Publish & Freeze</span>
                </>
              )}
            </button>
          )}

          {/* Auto Allocate Fast Action */}
          {isZoneAdmin && !isMonthFrozen && (
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="px-4 py-2 bg-[#E3F8AC] hover:bg-[#d4f294] text-[#0A3A33] text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F4C42]" />
              <span>Auto-Allocate Zone</span>
            </button>
          )}

          {/* Direct Outlook Calendar Shortcut */}
          <button
            onClick={() => setActiveTab('calendar')}
            className="px-4 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4F58C]" />
            <span>Open Calendar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE CORE SUMMARY CARDS WITH QUICK ACTION LINKS                      */}
      {/* 'Pending Approvals' · 'Monthly Duty Completion Rate' · 'Upcoming Satsang Events' */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SUMMARY CARD 1: PENDING APPROVALS */}
        <div className={`rounded-3xl p-6 border shadow-xs transition-all flex flex-col justify-between ${
          pendingApprovals.length > 0
            ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300'
            : 'bg-white border-[#E2EFEB] hover:border-[#2B8274]/40'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  pendingApprovals.length > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#E8F6F2] text-[#0F4C42]'
                }`}>
                  {pendingApprovals.length > 0 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <h3 className="text-sm font-extrabold text-[#0A3A33] tracking-tight">
                  Pending Approvals
                </h3>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  pendingApprovals.length > 0
                    ? 'bg-amber-200 text-amber-900 animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {pendingApprovals.length > 0 ? 'Action Required' : 'All Clear'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono tracking-tight ${
                pendingApprovals.length > 0 ? 'text-amber-950' : 'text-[#0A3A33]'
              }`}>
                {pendingApprovals.length}
              </span>
              <span className="text-xs text-[#719B93] font-medium">
                nominations awaiting review
              </span>
            </div>

            <div className="mt-3 space-y-1 text-xs text-[#4A726B]">
              <div className="flex items-center justify-between py-0.5">
                <span>Local Preachers:</span>
                <strong className="font-mono text-[#0A3A33]">{localPendingCount}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Other-Zone Requests:</span>
                <strong className="font-mono text-[#0A3A33]">{otherZonePendingCount}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Affected Branches:</span>
                <strong className="font-mono text-[#0A3A33]">{pendingBranchesCount}</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-[#0F4C42] hover:text-[#185e52] flex items-center gap-1 group py-1"
            >
              <span>Review in Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {isZoneAdmin && pendingApprovals.length > 0 ? (
              <button
                onClick={() => approveAllPending()}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve All ({pendingApprovals.length})</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('reports')}
                className="text-[11px] font-semibold text-[#719B93] hover:text-[#0A3A33] transition-colors"
              >
                View History
              </button>
            )}
          </div>
        </div>

        {/* SUMMARY CARD 2: MONTHLY DUTY COMPLETION RATE */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] hover:border-[#2B8274]/40 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F6F2] text-[#0F4C42] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#0A3A33] tracking-tight">
                  Monthly Duty Completion Rate
                </h3>
              </div>

              <span
                className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                  coveragePercent === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : coveragePercent >= 80
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {coveragePercent >= 100 ? '100% Fully Allocated' : `${coveragePercent}% Allocated`}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-[#0A3A33] tracking-tight">
                {coveragePercent}%
              </span>
              <span className="text-xs text-[#719B93] font-medium font-mono">
                ({filledDuties}/{totalCongregations} duties)
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-[#F0F7F5] h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-[#0F4C42] h-full transition-all duration-500 rounded-full"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>

            <div className="mt-3 space-y-1 text-xs text-[#4A726B]">
              <div className="flex items-center justify-between py-0.5">
                <span>Filled Congregations:</span>
                <strong className="font-mono text-[#0A3A33]">
                  {filledDuties} of {totalCongregations}
                </strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Unfilled / Open Slots:</span>
                <strong className={`font-mono ${unfilledSlots > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}`}>
                  {unfilledSlots} slots
                </strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Attendance Verified:</span>
                <strong className="font-mono text-[#0A3A33]">
                  {attendanceRate}% ({presentCount} present)
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-[#0F4C42] hover:text-[#185e52] flex items-center gap-1 group py-1"
            >
              <span>Allot in Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-[#2B8274] hover:text-[#0F4C42] flex items-center gap-1 py-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Full Report</span>
            </button>
          </div>
        </div>

        {/* SUMMARY CARD 3: UPCOMING SATSANG EVENTS */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] hover:border-[#2B8274]/40 shadow-xs transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F6F2] text-[#0F4C42] flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold text-[#0A3A33] tracking-tight">
                  Upcoming Satsang Events
                </h3>
              </div>

              <span className="text-[11px] font-bold bg-[#E8F6F2] text-[#0F4C42] px-2.5 py-0.5 rounded-full">
                {monthSpecialDays.length > 0 ? `${monthSpecialDays.length} Special Days` : 'Pune Zone 34'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-[#0A3A33] tracking-tight">
                {totalCongregations}
              </span>
              <span className="text-xs text-[#719B93] font-medium">
                total sessions scheduled
              </span>
            </div>

            {/* Next upcoming event snippet */}
            {nextUpcomingEvent ? (
              <div className="mt-3 p-2.5 bg-[#FAFDFD] rounded-2xl border border-[#E2EFEB] text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#719B93]">
                  <span className="font-semibold text-[#0F4C42]">Next Gathering:</span>
                  <span className="font-mono">{nextUpcomingEvent.date}</span>
                </div>
                <div className="mt-1 font-bold text-[#0A3A33] truncate">
                  {nextUpcomingEvent.branch.name} ({nextUpcomingEvent.satsang.time.split(' - ')[0]})
                </div>
                <div className="text-[11px] text-[#4A726B] truncate">
                  {nextUpcomingEvent.existingDuty?.type === 'vichar'
                    ? 'Satguru Mata Ji Vichar Video'
                    : nextUpcomingEvent.existingDuty?.type === 'local'
                    ? `Local: ${nextUpcomingEvent.existingDuty.localPracharakName}`
                    : nextUpcomingEvent.existingDuty?.pracharakId
                    ? pracharaks.find((p) => p.id === nextUpcomingEvent.existingDuty?.pracharakId)?.name
                    : 'Unassigned slot'}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-xs text-[#719B93]">
                No upcoming sessions in selected month
              </div>
            )}

            <div className="mt-3 space-y-1 text-xs text-[#4A726B]">
              <div className="flex items-center justify-between py-0.5">
                <span>Pracharak Duties:</span>
                <strong className="font-mono text-[#0A3A33]">{regularDuties}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Vichar Video Broadcasts:</span>
                <strong className="font-mono text-[#0A3A33]">{vicharDuties}</strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Active Pune Bhavans:</span>
                <strong className="font-mono text-[#0A3A33]">{activeBranches.length} centers</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-[#0F4C42] hover:text-[#185e52] flex items-center gap-1 group py-1"
            >
              <span>Open Duty Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {isZoneAdmin ? (
              <button
                onClick={() => setActiveTab('masters')}
                className="text-xs font-semibold text-[#4A726B] hover:text-[#0A3A33] transition-colors py-1"
              >
                Manage Bhavans
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-[#4A726B] hover:text-[#0A3A33] transition-colors py-1"
              >
                View Roster
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SECTOR SWITCHER & CONGREGATION BREADCRUMB */}
      {/* ========================================================================= */}
      {isZoneAdmin && (
        <div className="bg-white rounded-2xl p-2.5 px-4 border border-[#E2EFEB] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0A3A33]">
            <Building className="w-4 h-4 text-[#2B8274]" />
            <span>Filter Operations by Sector:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedSectorId('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                selectedSectorId === 'all'
                  ? 'bg-[#0F4C42] text-white shadow-xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]'
              }`}
            >
              All Zone 34 ({branches.length} Branches)
            </button>
            {sectors.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSectorId(s.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all ${
                  selectedSectorId === s.id
                    ? 'bg-[#0F4C42] text-white shadow-xs'
                    : 'text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]'
                }`}
              >
                {s.name} ({s.code})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TWO-COLUMN COMMAND GRID: UPCOMING AGENDA & WORKLOAD INTELLIGENCE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 Cols): Upcoming Satsang Agenda & Fleet Load */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Satsang Congregations Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0A3A33]">
                  Upcoming Satsang Congregations
                </h3>
                <p className="text-xs text-[#719B93] mt-0.5">
                  Scheduled gatherings in {monthName} across active Pune Bhavans
                </p>
              </div>

              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-[#0F4C42] hover:text-[#185e52] flex items-center gap-1 group"
              >
                <span>Full Outlook Calendar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* List of upcoming slots */}
            <div className="space-y-2.5">
              {upcomingSlots.length === 0 ? (
                <div className="p-8 text-center bg-[#F9FCFB] rounded-2xl border border-dashed border-[#D5E8E3]">
                  <p className="text-xs font-semibold text-[#4A726B]">
                    No satsangs scheduled for this sector in {monthName}
                  </p>
                </div>
              ) : (
                upcomingSlots.map((slot) => {
                  const duty = slot.existingDuty;
                  const pr = duty?.pracharakId
                    ? pracharaks.find((p) => p.id === duty.pracharakId)
                    : null;

                  return (
                    <div
                      key={`${slot.date}-${slot.branch.id}-${slot.satsang.id}`}
                      className="p-3.5 bg-[#FAFDFD] hover:bg-white rounded-2xl border border-[#E2EFEB] hover:border-[#2B8274] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#0F4C42] text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] uppercase font-bold text-[#D4F58C]">
                            {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-sm font-extrabold font-mono leading-none mt-0.5">
                            {slot.date.split('-')[2]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-xs text-[#0A3A33]">
                              {slot.branch.name}
                            </h4>
                            <span className="text-[10px] text-[#719B93]">·</span>
                            <span className="text-[11px] font-mono text-[#4A726B]">
                              {slot.satsang.time.split(' - ')[0]}
                            </span>
                            {slot.isVisheshDin && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                Vishesh Din
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#4A726B] mt-0.5">
                            {slot.branch.satsangBhavan}
                          </p>

                          {/* Preacher allocated */}
                          <div className="mt-1.5 flex items-center gap-2 text-xs">
                            <span className="text-[#719B93] text-[11px]">Duty:</span>
                            {duty?.type === 'vichar' ? (
                              <span className="font-bold text-[#2B8274] flex items-center gap-1">
                                <Video className="w-3.5 h-3.5" />
                                <span>Satguru Mata Ji Vichar Broadcast</span>
                              </span>
                            ) : duty?.type === 'local' ? (
                              <span className="font-bold text-amber-800">
                                {duty.localPracharakName} (Local Branch Preacher)
                              </span>
                            ) : duty?.type === 'other_zone' ? (
                              <span className="font-bold text-purple-800">
                                {duty.otherZoneDetails} (Other Zone Preacher)
                              </span>
                            ) : pr ? (
                              <span className="font-bold text-[#0A3A33]">
                                {pr.name} ·{' '}
                                <span className="text-[#719B93] font-normal">
                                  Category {pr.category} (
                                  {branches.find((b) => b.id === pr.homeBranchId)?.name || 'Pune'}
                                  )
                                </span>
                              </span>
                            ) : (
                              <span className="font-semibold text-amber-700 italic">
                                Unallocated Slot
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Quick Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {duty ? (
                          duty.attendance === 'PRESENT' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-1 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Present</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedDutyForAttendance(duty)}
                              className="px-3 py-1 bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#0A3A33] border border-[#D5E8E3] rounded-xl text-xs font-semibold transition-colors"
                            >
                              Mark Attendance
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => setActiveTab('calendar')}
                            className="px-3 py-1 bg-[#0F4C42] hover:bg-[#145d51] text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                          >
                            + Allot
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pracharak Fleet Capacity & Workload Balance */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0A3A33]">
                  Pracharak Fleet Deployment & Workload Balance
                </h3>
                <p className="text-xs text-[#719B93] mt-0.5">
                  Distribution of monthly allocations (Rule: Maximum 4 duties per preacher per month)
                </p>
              </div>

              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-bold text-[#0F4C42] hover:underline"
              >
                Detailed Chart →
              </button>
            </div>

            {/* 4 Workload Distribution Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#FAFDFD] rounded-2xl border border-[#E2EFEB] text-center">
                <span className="text-[11px] font-bold text-[#719B93] block">1 Duty</span>
                <span className="text-2xl font-extrabold font-mono text-[#0A3A33] mt-1 block">
                  {workloadStats[1]}
                </span>
                <span className="text-[10px] text-[#4A726B]">preachers</span>
              </div>

              <div className="p-3.5 bg-[#FAFDFD] rounded-2xl border border-[#E2EFEB] text-center">
                <span className="text-[11px] font-bold text-[#719B93] block">2 Duties</span>
                <span className="text-2xl font-extrabold font-mono text-[#0A3A33] mt-1 block">
                  {workloadStats[2]}
                </span>
                <span className="text-[10px] text-[#4A726B]">preachers</span>
              </div>

              <div className="p-3.5 bg-[#FAFDFD] rounded-2xl border border-[#E2EFEB] text-center">
                <span className="text-[11px] font-bold text-[#719B93] block">3 Duties</span>
                <span className="text-2xl font-extrabold font-mono text-[#0A3A33] mt-1 block">
                  {workloadStats[3]}
                </span>
                <span className="text-[10px] text-[#4A726B]">preachers</span>
              </div>

              <div className="p-3.5 bg-[#FAFDFD] rounded-2xl border border-[#E2EFEB] text-center">
                <span className="text-[11px] font-bold text-amber-700 block">4 Duties (Max)</span>
                <span className="text-2xl font-extrabold font-mono text-amber-900 mt-1 block">
                  {workloadStats[4]}
                </span>
                <span className="text-[10px] text-amber-700">capacity reached</span>
              </div>
            </div>

            {/* Top Deployed Preachers Table */}
            <div>
              <span className="text-xs font-bold text-[#0A3A33] uppercase tracking-wider block mb-2">
                Top Active Preachers This Month
              </span>

              <div className="divide-y divide-[#E2EFEB] border border-[#E2EFEB] rounded-2xl overflow-hidden">
                {topDeployedPreachers.map((item) => (
                  <div
                    key={item.pracharak.id}
                    className="p-3 bg-white hover:bg-[#FAFDFD] flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E3F8AC] text-[#0A3A33] font-extrabold flex items-center justify-center text-xs">
                        {item.pracharak.category}
                      </div>
                      <div>
                        <span className="font-extrabold text-[#0A3A33] block">
                          {item.pracharak.name}
                        </span>
                        <span className="text-[11px] text-[#719B93]">
                          {branches.find((b) => b.id === item.pracharak.homeBranchId)?.name || 'Pune'}{' '}
                          · {item.pracharak.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0A3A33] bg-[#F0F7F5] px-2.5 py-1 rounded-xl text-xs">
                        {item.count} / 4 Duties
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Action Center, Special Days & Quick Links */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Center / Immediate Attention Needed */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A3A33] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#2B8274]" />
                <span>Zone Attention Center</span>
              </span>
              <span className="text-[11px] font-bold text-[#719B93]">Live Invariants</span>
            </div>

            <div className="space-y-3">
              {/* Unfilled slots notice */}
              <div
                onClick={() => setActiveTab('calendar')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#2B8274] bg-[#FAFDFD] transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#0A3A33] block">
                    {unfilledSlots === 0
                      ? 'All Satsangs Fully Allocated'
                      : `${unfilledSlots} Unfilled Satsang Slots`}
                  </span>
                  <span className="text-[11px] text-[#719B93]">
                    {unfilledSlots === 0
                      ? '100% of congregation dates have assigned preachers or vichar'
                      : 'Requires preacher assignment before publishing month'}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2B8274]" />
              </div>

              {/* Preachers on hold notice */}
              <div
                onClick={() => setActiveTab('masters')}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-[#2B8274] bg-[#FAFDFD] transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#0A3A33] block">
                    {activeMonthHolds.length} Preachers on Active Leave / Hold
                  </span>
                  <span className="text-[11px] text-[#719B93]">
                    Protected against accidental duty assignment
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2B8274]" />
              </div>

              {/* Pending Approvals quick item */}
              {pendingApprovals.length > 0 && (
                <div
                  onClick={() => setActiveTab('calendar')}
                  className="p-3.5 rounded-2xl border border-amber-300 bg-amber-50/50 hover:border-amber-500 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-900 block">
                      {pendingApprovals.length} Mukhi Nominations Pending
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Local preacher & other-zone allocations awaiting signature
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-700" />
                </div>
              )}
            </div>
          </div>

          {/* Special Spiritual Days (Vishesh Din & Samagams) */}
          <div className="bg-white rounded-3xl p-6 border border-[#E2EFEB] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A3A33] flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-amber-600" />
                <span>Special Days & Samagams</span>
              </span>
              <span className="text-[11px] font-bold text-[#719B93]">
                {monthSpecialDays.length} Events
              </span>
            </div>

            {monthSpecialDays.length === 0 ? (
              <p className="text-xs text-[#719B93] py-2">
                No Vishesh Din or special samagams recorded in {monthName}.
              </p>
            ) : (
              <div className="space-y-2.5">
                {monthSpecialDays.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-950 font-bold">{sp.name}</strong>
                      <span className="font-mono text-[11px] text-amber-900 bg-amber-200 px-2 py-0.5 rounded-md">
                        {sp.startDate === sp.endDate ? sp.startDate : `${sp.startDate} to ${sp.endDate}`}
                      </span>
                    </div>
                    {sp.description && (
                      <p className="text-[11px] text-amber-800 mt-1">{sp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Zone Directory Metrics */}
          <div className="bg-[#FAFDFD] rounded-3xl p-6 border border-[#E2EFEB] shadow-xs space-y-3">
            <span className="text-xs font-bold text-[#0A3A33] uppercase tracking-wider block">
              Zone 34 Infrastructure Overview
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-2xl border border-[#D5E8E3]">
                <span className="text-[10px] text-[#719B93] block">Active Sectors</span>
                <span className="text-xl font-bold font-mono text-[#0A3A33] mt-0.5 block">
                  {sectors.length}
                </span>
                <span className="text-[10px] text-[#4A726B]">Pune Metropolitan</span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D5E8E3]">
                <span className="text-[10px] text-[#719B93] block">Congregation Bhavans</span>
                <span className="text-xl font-bold font-mono text-[#0A3A33] mt-0.5 block">
                  {branches.length}
                </span>
                <span className="text-[10px] text-[#4A726B]">Registered Centers</span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D5E8E3]">
                <span className="text-[10px] text-[#719B93] block">Empaneled Pracharaks</span>
                <span className="text-xl font-bold font-mono text-[#0A3A33] mt-0.5 block">
                  {pracharaks.length}
                </span>
                <span className="text-[10px] text-[#4A726B]">A+, A, B+, B, C</span>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-[#D5E8E3]">
                <span className="text-[10px] text-[#719B93] block">Weekly Sessions</span>
                <span className="text-xl font-bold font-mono text-[#0A3A33] mt-0.5 block">
                  Sunday + Wed
                </span>
                <span className="text-[10px] text-[#4A726B]">Standard Cadence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Allocate Modal */}
      {isAutoModalOpen && (
        <AutoAllocateModal
          isOpen={isAutoModalOpen}
          onClose={() => setIsAutoModalOpen(false)}
        />
      )}

      {/* Attendance Feedback Modal */}
      {selectedDutyForAttendance && (
        <AttendanceFeedbackModal
          isOpen={!!selectedDutyForAttendance}
          duty={selectedDutyForAttendance}
          onClose={() => setSelectedDutyForAttendance(null)}
        />
      )}
    </div>
  );
};

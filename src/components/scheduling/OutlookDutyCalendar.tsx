import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Lock,
  Unlock,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Video,
  User,
  MapPin,
  Building,
  Phone,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  CheckCheck,
  ChevronDown,
  Layers,
  Eye,
  ListFilter,
  Printer,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  DutyAllocation,
  DutyType,
  Branch,
  Satsang,
  Pracharak,
  ApprovalStatus,
  AttendanceStatus,
} from '../../types';
import { AutoAllocateModal } from './AutoAllocateModal';
import { AttendanceFeedbackModal } from '../attendance/AttendanceFeedbackModal';
import { PdfDutyChartModal } from './PdfDutyChartModal';
import { exportDutyChartExcel } from '../../utils/excelExporter';
import { THEME_CONFIGS } from '../../utils/themeConfig';

type CalendarViewMode = 'month' | 'week' | 'day' | 'table';

export const OutlookDutyCalendar: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    isMonthFrozen,
    currentMonthFreeze,
    isZoneAdmin,
    currentUser,
    userBranch,
    branches,
    sectors,
    pracharaks,
    satsangs,
    dutyAllocations,
    appSettings,
    allocateDuty,
    deleteDuty,
    freezeCurrentMonth,
    unfreezeCurrentMonth,
    isPracharakOnHold,
    getSatsangDatesForMonth,
    t,
    lang,
    theme,
  } = useApp();

  const themeConfig = THEME_CONFIGS[theme] || THEME_CONFIGS.mint;

  // View state
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(1);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Sector and category filters
  const [activeSectorIds, setActiveSectorIds] = useState<string[]>(['all']);
  const [activeDutyTypes, setActiveDutyTypes] = useState<string[]>([
    'pracharak',
    'vichar',
    'local',
    'other_zone',
  ]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isZoneAdmin ? 'all' : currentUser.branchId || 'all'
  );

  // Modals
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<{
    slot: any;
    duty?: DutyAllocation;
  } | null>(null);
  const [attendanceModalDuty, setAttendanceModalDuty] = useState<DutyAllocation | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Allotment Modal (Outlook "New Appointment / Event" dialog)
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [allotFormDate, setAllotFormDate] = useState<string>('');
  const [allotFormBranchId, setAllotFormBranchId] = useState<string>('');
  const [allotFormSatsangId, setAllotFormSatsangId] = useState<string>('');
  const [allotFormDutyType, setAllotFormDutyType] = useState<DutyType>('pracharak');
  const [allotFormPracharakId, setAllotFormPracharakId] = useState<string>('');
  const [allotFormLocalName, setAllotFormLocalName] = useState<string>('');
  const [allotFormOtherZone, setAllotFormOtherZone] = useState<string>('');
  const [allotFormOverrideReason, setAllotFormOverrideReason] = useState<string>('');
  const [allotFormError, setAllotFormError] = useState<string>('');

  // Month navigation
  const prevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    // For app demo, keep in 2026 October or current system date
    setSelectedYear(2026);
    setSelectedMonth(10);
    setSelectedDayNumber(4);
  };

  // Month metadata
  const monthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayWeekday = monthDate.getDay(); // 0 is Sunday

  // All slots in month
  const targetBranch = isZoneAdmin
    ? selectedBranchId !== 'all'
      ? selectedBranchId
      : undefined
    : currentUser.branchId;

  const allMonthSlots = useMemo(() => {
    return getSatsangDatesForMonth(selectedYear, selectedMonth, targetBranch);
  }, [selectedYear, selectedMonth, targetBranch, getSatsangDatesForMonth]);

  // Filtered slots
  const filteredSlots = useMemo(() => {
    return allMonthSlots.filter((slot) => {
      // Sector filter
      if (!activeSectorIds.includes('all') && !activeSectorIds.includes(slot.branch.sectorId)) {
        return false;
      }
      // Branch filter
      if (selectedBranchId !== 'all' && slot.branch.id !== selectedBranchId) {
        return false;
      }
      // Duty type filter
      if (slot.existingDuty) {
        if (!activeDutyTypes.includes(slot.existingDuty.type)) {
          return false;
        }
      }
      // Search query
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const branchMatch = slot.branch.name.toLowerCase().includes(query);
        const preacherMatch =
          slot.existingDuty?.pracharakId &&
          pracharaks.find((p) => p.id === slot.existingDuty?.pracharakId)?.name.toLowerCase().includes(query);
        const localMatch = slot.existingDuty?.localPracharakName?.toLowerCase().includes(query);
        const otherMatch = slot.existingDuty?.otherZoneDetails?.toLowerCase().includes(query);
        if (!branchMatch && !preacherMatch && !localMatch && !otherMatch) {
          return false;
        }
      }
      return true;
    });
  }, [allMonthSlots, activeSectorIds, selectedBranchId, activeDutyTypes, searchFilter, pracharaks]);

  // Open the quick allotment modal for a specific date or slot
  const handleOpenAllot = (dateStr?: string, branch?: Branch, satsang?: Satsang, existingDuty?: DutyAllocation) => {
    if (isMonthFrozen && !isZoneAdmin) return;

    const defaultDate =
      dateStr ||
      `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDayNumber).padStart(2, '0')}`;
    const defaultBranchId = branch ? branch.id : branches[0]?.id || '';
    const defaultSatsangId = satsang
      ? satsang.id
      : satsangs.find((s) => s.branchId === defaultBranchId)?.id || satsangs[0]?.id || '';

    setAllotFormDate(defaultDate);
    setAllotFormBranchId(defaultBranchId);
    setAllotFormSatsangId(defaultSatsangId);
    setAllotFormError('');

    if (existingDuty) {
      setAllotFormDutyType(existingDuty.type);
      setAllotFormPracharakId(existingDuty.pracharakId || '');
      setAllotFormLocalName(existingDuty.localPracharakName || '');
      setAllotFormOtherZone(existingDuty.otherZoneDetails || '');
      setAllotFormOverrideReason(existingDuty.overrideReason || '');
    } else {
      setAllotFormDutyType('pracharak');
      setAllotFormPracharakId('');
      setAllotFormLocalName('');
      setAllotFormOtherZone('');
      setAllotFormOverrideReason('');
    }

    setIsAllotModalOpen(true);
  };

  // Click-and-Hold interaction state for calendar cells (inspired by Outlook meeting invitations)
  const [holdingCellKey, setHoldingCellKey] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHoldingCellKey(null);
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(
    (cellKey: string, dateStr: string, branch?: Branch, satsang?: Satsang) => {
      if (isMonthFrozen && !isZoneAdmin) return;
      cancelHold();
      isLongPressTriggeredRef.current = false;
      setHoldingCellKey(cellKey);
      setHoldProgress(0);

      const HOLD_MS = 400; // 400ms duration for quick & responsive hold
      const startTime = Date.now();

      holdIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.round((elapsed / HOLD_MS) * 100));
        setHoldProgress(progress);
      }, 16);

      holdTimerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        cancelHold();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch (_) {}
        }
        handleOpenAllot(dateStr, branch, satsang);
      }, HOLD_MS);
    },
    [isMonthFrozen, isZoneAdmin, cancelHold, handleOpenAllot]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      cancelHold();
    };
  }, [cancelHold]);

  const handleSaveAllotment = () => {
    if (!allotFormDate || !allotFormBranchId || !allotFormSatsangId) {
      setAllotFormError('Please select a date, branch, and satsang session.');
      return;
    }

    if (allotFormDutyType === 'pracharak' && !allotFormPracharakId) {
      setAllotFormError('Please select a Pracharak preacher to assign.');
      return;
    }

    if (allotFormDutyType === 'local' && !allotFormLocalName.trim()) {
      setAllotFormError('Please enter the Local Pracharak preacher name.');
      return;
    }

    if (allotFormDutyType === 'other_zone' && !allotFormOtherZone.trim()) {
      setAllotFormError('Please enter Other-Zone preacher name and origin zone.');
      return;
    }

    const res = allocateDuty({
      date: allotFormDate,
      branchId: allotFormBranchId,
      satsangId: allotFormSatsangId,
      type: allotFormDutyType,
      pracharakId: allotFormDutyType === 'pracharak' ? allotFormPracharakId : undefined,
      localPracharakName: allotFormDutyType === 'local' ? allotFormLocalName : undefined,
      otherZoneDetails: allotFormDutyType === 'other_zone' ? allotFormOtherZone : undefined,
      overrideReason: allotFormOverrideReason.trim() ? allotFormOverrideReason : undefined,
    });

    if (!res.success) {
      setAllotFormError(res.message || 'Allocation could not be completed.');
      return;
    }

    setIsAllotModalOpen(false);
    setSelectedEventForDetail(null);
  };

  const handleDeleteCurrentDuty = (dutyId: string) => {
    deleteDuty(dutyId);
    setSelectedEventForDetail(null);
  };

  // Group slots by day of month (1 to 31)
  const slotsByDay = useMemo(() => {
    const map: Record<number, typeof filteredSlots> = {};
    for (let d = 1; d <= 31; d++) {
      map[d] = [];
    }
    filteredSlots.forEach((slot) => {
      const dt = new Date(slot.date);
      const day = dt.getDate();
      if (map[day]) {
        map[day].push(slot);
      }
    });
    return map;
  }, [filteredSlots]);

  // Pending duties count for Zone Admin alert
  const pendingApprovals = dutyAllocations.filter((d) => d.approvalStatus === 'PENDING');

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto select-none">
      {/* Outlook Top Action & View Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E2EFEB] p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Navigation and Date Heading */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Outlook-style + New Duty Button */}
          <button
            onClick={() => handleOpenAllot()}
            className="px-4 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#D4F58C]" />
            <span>Allot Duty</span>
          </button>

          {/* Today Button */}
          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#0A3A33] border border-[#D5E8E3] rounded-xl text-xs font-bold transition-colors"
          >
            Today
          </button>

          {/* Month Steppers */}
          <div className="flex items-center bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl overflow-hidden p-0.5">
            <button
              onClick={prevMonth}
              title="Previous Month"
              className="p-1.5 hover:bg-white text-[#0A3A33] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              title="Next Month"
              className="p-1.5 hover:bg-white text-[#0A3A33] rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Current Month & Year Display */}
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0A3A33] tracking-tight">
            {monthName}
          </h2>

          {/* Month Status Badge */}
          {isMonthFrozen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>Published & Frozen</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <Unlock className="w-3 h-3 text-emerald-700" />
              <span>Draft (Editing Active)</span>
            </span>
          )}

          {/* Click & Hold Hint Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F7F5] text-[#0F4C42] border border-[#D5E8E3]">
            <Clock className="w-3 h-3 text-[#2B8274]" />
            <span>Click & hold cell to allot duty</span>
          </div>
        </div>

        {/* Right: View Switcher and Administrative Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Outlook-style View Switcher */}
          <div className="flex items-center bg-[#F0F7F5] p-1 rounded-xl border border-[#D5E8E3]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-[#0A3A33] shadow-xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-[#0A3A33] shadow-xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-[#0A3A33] shadow-xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#0A3A33] shadow-xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Matrix Table
            </button>
          </div>

          {/* Auto Allocate Button (Admin Only) */}
          {isZoneAdmin && (
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="px-3 py-1.5 bg-[#E3F8AC] hover:bg-[#d5f096] text-[#0A3A33] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F4C42]" />
              <span>Auto-Allocate</span>
            </button>
          )}

          {/* Freeze / Unfreeze Action Button */}
          {isZoneAdmin && (
            <button
              onClick={() => {
                if (isMonthFrozen) {
                  unfreezeCurrentMonth();
                } else {
                  freezeCurrentMonth();
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all shadow-2xs ${
                isMonthFrozen
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
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

          {/* Export to Excel */}
          <button
            onClick={() =>
              exportDutyChartExcel(
                dutyAllocations.filter((d) => {
                  const dt = new Date(d.date);
                  return dt.getFullYear() === selectedYear && dt.getMonth() + 1 === selectedMonth;
                }),
                branches,
                pracharaks,
                monthName,
                lang
              )
            }
            className="p-2 bg-white hover:bg-[#F0F7F5] text-[#0A3A33] rounded-xl border border-[#D5E8E3] transition-colors shadow-2xs"
            title="Download Excel Duty Chart"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2B8274]" />
          </button>

          {/* Export to PDF Duty Chart (Devanagari Hindi & Marathi Font Supported) */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-[#F0F7F5] text-[#0A3A33] rounded-xl border border-[#D5E8E3] transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold"
            title="Export PDF Duty Chart (with Devanagari Hindi/Marathi support)"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Export PDF Chart</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Notice Banner (If any) */}
      {isZoneAdmin && pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-amber-900 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold">
              {pendingApprovals.length} duties awaiting Zone Admin approval
            </span>
            <span className="text-amber-700 text-[11px] hidden sm:inline">
              (Local preacher and Other-Zone allocations submitted by Branch Mukhis)
            </span>
          </div>
          <button
            onClick={() => {
              // Open first pending event in detail modal
              const firstPending = pendingApprovals[0];
              const slot = allMonthSlots.find((s) => s.existingDuty?.id === firstPending.id);
              if (slot) {
                setSelectedEventForDetail({ slot, duty: firstPending });
              }
            }}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors"
          >
            Review Next
          </button>
        </div>
      )}

      {/* Main Calendar Body: Left Sidebar + Center Outlook Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Outlook Left Filter & Mini Calendar Pane (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mini Calendar Card (Just like Outlook left panel) */}
          <div className="bg-white rounded-2xl border border-[#E2EFEB] p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#0A3A33]">
                {monthDate.toLocaleString('default', { month: 'short' })} {selectedYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-[#F0F7F5] rounded-md text-[#4A726B]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-[#F0F7F5] rounded-md text-[#4A726B]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Calendar 7-Day Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#719B93] mb-1">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Mini Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <span key={`empty-${i}`} className="py-1 text-transparent select-none">
                  -
                </span>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasDuties = (slotsByDay[day] || []).length > 0;
                const isSelected = selectedDayNumber === day;

                return (
                  <button
                    key={`mini-day-${day}`}
                    onClick={() => {
                      setSelectedDayNumber(day);
                      // Calculate week index
                      const wk = Math.ceil((day + firstDayWeekday) / 7);
                      setSelectedWeekIndex(wk);
                      if (viewMode === 'table') setViewMode('month');
                    }}
                    className={`py-1 rounded-lg text-xs font-medium transition-colors relative ${
                      isSelected
                        ? 'bg-[#0F4C42] text-white font-bold'
                        : hasDuties
                        ? 'hover:bg-[#E8F6F2] text-[#0A3A33] font-semibold'
                        : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span>{day}</span>
                    {hasDuties && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#2B8274] absolute bottom-0.5 left-1/2 -translate-x-1/2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Preacher / Branch Search */}
          <div className="bg-white rounded-2xl border border-[#E2EFEB] p-3 shadow-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#719B93] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search preacher or branch..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0A3A33] placeholder-[#719B93] focus:outline-none"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Outlook-style Category Checkboxes (My Calendars) */}
          <div className="bg-white rounded-2xl border border-[#E2EFEB] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#0A3A33]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2B8274]" />
                <span>Duty Categories</span>
              </span>
              <button
                onClick={() =>
                  setActiveDutyTypes([
                    'pracharak',
                    'vichar',
                    'local',
                    'other_zone',
                  ])
                }
                className="text-[10px] text-[#2B8274] hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDutyTypes.includes('pracharak')}
                  onChange={(e) => {
                    if (e.target.checked) setActiveDutyTypes([...activeDutyTypes, 'pracharak']);
                    else setActiveDutyTypes(activeDutyTypes.filter((x) => x !== 'pracharak'));
                  }}
                  className="rounded text-[#0F4C42] focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F4C42]" />
                <span className="text-[#0A3A33] font-medium">Regular Pracharak</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDutyTypes.includes('vichar')}
                  onChange={(e) => {
                    if (e.target.checked) setActiveDutyTypes([...activeDutyTypes, 'vichar']);
                    else setActiveDutyTypes(activeDutyTypes.filter((x) => x !== 'vichar'));
                  }}
                  className="rounded text-[#82C341] focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#82C341]" />
                <span className="text-[#0A3A33] font-medium">Satguru Mata Ji Vichar</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDutyTypes.includes('local')}
                  onChange={(e) => {
                    if (e.target.checked) setActiveDutyTypes([...activeDutyTypes, 'local']);
                    else setActiveDutyTypes(activeDutyTypes.filter((x) => x !== 'local'));
                  }}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[#0A3A33] font-medium">Local Preacher (Branch)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDutyTypes.includes('other_zone')}
                  onChange={(e) => {
                    if (e.target.checked) setActiveDutyTypes([...activeDutyTypes, 'other_zone']);
                    else setActiveDutyTypes(activeDutyTypes.filter((x) => x !== 'other_zone'));
                  }}
                  className="rounded text-purple-600 focus:ring-0"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                <span className="text-[#0A3A33] font-medium">Other-Zone Preacher</span>
              </label>
            </div>
          </div>

          {/* Sector & Branch Filters */}
          <div className="bg-white rounded-2xl border border-[#E2EFEB] p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold text-[#0A3A33] flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#2B8274]" />
              <span>Sectors & Branches</span>
            </span>

            {isZoneAdmin ? (
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] text-[#719B93] uppercase font-bold block mb-1">
                    Sector
                  </label>
                  <select
                    value={activeSectorIds[0] || 'all'}
                    onChange={(e) => setActiveSectorIds([e.target.value])}
                    className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-2.5 py-1.5 text-xs text-[#0A3A33] focus:outline-none font-medium"
                  >
                    <option value="all">All Sectors ({sectors.length})</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#719B93] uppercase font-bold block mb-1">
                    Branch
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-2.5 py-1.5 text-xs text-[#0A3A33] focus:outline-none font-medium"
                  >
                    <option value="all">All Branches ({branches.length})</option>
                    {branches
                      .filter((b) =>
                        activeSectorIds.includes('all') ? true : activeSectorIds.includes(b.sectorId)
                      )
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-[#F0F7F5] rounded-xl text-xs text-[#0A3A33]">
                <p className="font-bold">{userBranch?.name}</p>
                <p className="text-[11px] text-[#4A726B]">{userBranch?.code} · Mukhi View</p>
              </div>
            )}
          </div>
        </div>

        {/* Outlook Center Calendar Canvas (9 Cols) */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
          {/* ========================================================================= */}
          {/* 1. MONTH VIEW (Outlook Standard) */}
          {/* ========================================================================= */}
          {viewMode === 'month' && (
            <div>
              {/* 7-Day Header */}
              <div className="grid grid-cols-7 border-b border-[#E2EFEB] bg-[#F5FAF8] text-center text-xs font-bold text-[#4A726B]">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                  (dayName, i) => (
                    <div key={dayName} className="py-2.5 border-r last:border-r-0 border-[#E2EFEB]">
                      <span className="hidden sm:inline">{dayName}</span>
                      <span className="sm:hidden">{dayName.slice(0, 3)}</span>
                    </div>
                  )
                )}
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-y divide-x divide-[#E2EFEB]">
                {/* Leading blanks */}
                {Array.from({ length: firstDayWeekday }).map((_, i) => (
                  <div
                    key={`blank-${i}`}
                    className="min-h-[110px] bg-[#FAFDFD]/40 p-2 text-slate-300"
                  />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
                    day
                  ).padStart(2, '0')}`;
                  const daySlots = slotsByDay[day] || [];
                  const isSelectedDay = selectedDayNumber === day;
                  const isSpecial = daySlots.some((s) => s.isVisheshDin);

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={(e) => {
                        if (isLongPressTriggeredRef.current) {
                          isLongPressTriggeredRef.current = false;
                          e.stopPropagation();
                          return;
                        }
                        setSelectedDayNumber(day);
                      }}
                      onMouseDown={(e) => {
                        if (e.button === 0) {
                          startHold(`month-${day}`, dateStr);
                        }
                      }}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={() => startHold(`month-${day}`, dateStr)}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      title={`Date: ${dateStr} · Click & hold to allot duty`}
                      className={`min-h-[115px] p-1.5 transition-all group flex flex-col justify-between relative cursor-pointer select-none ${
                        isSelectedDay
                          ? 'bg-[#F2FAF7] ring-1 ring-[#0F4C42]/30'
                          : 'hover:bg-[#FAFDFD] bg-white'
                      }`}
                    >
                      {/* Click-and-Hold Progress Feedback Overlay (Outlook Meeting Invitation feel) */}
                      {holdingCellKey === `month-${day}` && (
                        <div className="absolute inset-0 bg-[#0F4C42]/10 backdrop-blur-2xs rounded-xl flex flex-col items-center justify-center z-30 pointer-events-none transition-all animate-fadeIn">
                          <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-[#0F4C42] relative animate-pulse">
                            <Plus className="w-5 h-5 text-[#0F4C42]" />
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-[#2B8274]"
                                fill="transparent"
                                strokeDasharray="100"
                                strokeDashoffset={100 - holdProgress}
                              />
                            </svg>
                          </div>
                          <span className="text-[10px] font-bold text-[#0A3A33] mt-1 bg-white/95 px-2 py-0.5 rounded-full shadow-xs border border-[#D5E8E3]">
                            Hold to Allot Duty...
                          </span>
                        </div>
                      )}

                      {/* Cell Header: Date Number + Quick Allot Trigger */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelectedDay
                              ? 'bg-[#0F4C42] text-white shadow-2xs'
                              : 'text-[#0A3A33] group-hover:bg-[#E8F6F2]'
                          }`}
                        >
                          {day}
                        </span>

                        {/* Hover + Allot button directly on day cell (Outlook style) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAllot(dateStr);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          title={`Allot duty for ${dateStr}`}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E3F8AC] text-[#0F4C42] rounded-md transition-opacity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Vishesh Din Banner if any */}
                      {isSpecial && (
                        <div className="mb-1 px-1.5 py-0.5 rounded bg-amber-100/90 text-amber-900 text-[10px] font-bold border border-amber-300 truncate">
                          Samagam / Vishesh Din
                        </div>
                      )}

                      {/* Outlook Event Chips */}
                      <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-none">
                        {daySlots.map((slot) => {
                          const duty = slot.existingDuty;
                          const pr = duty?.pracharakId
                            ? pracharaks.find((p) => p.id === duty.pracharakId)
                            : null;

                          let chipBg = 'bg-[#EBF7F4] text-[#0F4C42] border-l-4 border-l-[#0F4C42]';
                          let title = pr ? pr.name : 'Allocated Preacher';

                          if (!duty || duty.type === 'unfilled') {
                            chipBg = 'bg-slate-100 text-slate-600 border-l-4 border-l-slate-400 border-dashed';
                            title = 'Unfilled Slot';
                          } else if (duty.type === 'vichar') {
                            chipBg = 'bg-emerald-50 text-emerald-900 border-l-4 border-l-[#82C341]';
                            title = 'Satguru Mata Ji Vichar';
                          } else if (duty.type === 'local') {
                            chipBg = 'bg-amber-50 text-amber-900 border-l-4 border-l-amber-500';
                            title = duty.localPracharakName || 'Local Preacher';
                          } else if (duty.type === 'other_zone') {
                            chipBg = 'bg-purple-50 text-purple-900 border-l-4 border-l-purple-600';
                            title = duty.otherZoneDetails || 'Other Zone';
                          }

                          return (
                            <div
                              key={`${slot.date}-${slot.branch.id}-${slot.satsang.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEventForDetail({ slot, duty });
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              onTouchStart={(e) => e.stopPropagation()}
                              className={`p-1 rounded text-[11px] shadow-2xs font-medium cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-between ${chipBg}`}
                            >
                              <div className="truncate flex-1">
                                <span className="font-bold truncate block">{title}</span>
                                <span className="text-[9px] opacity-75 truncate block">
                                  {slot.branch.name} · {slot.satsang.time.split(' - ')[0]}
                                </span>
                              </div>

                              {duty?.approvalStatus === 'PENDING' && (
                                <span
                                  className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1"
                                  title="Pending Approval"
                                />
                              )}
                              {duty?.attendance === 'PRESENT' && (
                                <span title="Present">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700 shrink-0 ml-1" />
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Empty cell helper prompt */}
                      {daySlots.length === 0 && !isSpecial && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAllot(dateStr);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="h-10 flex items-center justify-center text-[10px] text-slate-300 hover:text-[#2B8274] transition-colors"
                        >
                          + Allot (or hold)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. WEEK VIEW (Outlook Time Block Schedule) */}
          {/* ========================================================================= */}
          {viewMode === 'week' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2EFEB] pb-3">
                <span className="text-xs font-bold text-[#0A3A33]">
                  Week {selectedWeekIndex} Schedule Overview
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#4A726B]">
                  <span>Select Week:</span>
                  {[1, 2, 3, 4, 5].map((wk) => (
                    <button
                      key={`wk-btn-${wk}`}
                      onClick={() => setSelectedWeekIndex(wk)}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-colors ${
                        selectedWeekIndex === wk
                          ? 'bg-[#0F4C42] text-white'
                          : 'bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#0A3A33]'
                      }`}
                    >
                      {wk}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7 Columns for the week */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekdayName, wIdx) => {
                  // Find matching slots in this week
                  const weekSlots = filteredSlots.filter(
                    (s) => s.weekday === wIdx && s.weekNumber === selectedWeekIndex
                  );
                  const firstSlotDate = weekSlots[0]?.date || '';
                  const estimatedDay = Math.max(1, Math.min(daysInMonth, (selectedWeekIndex - 1) * 7 + (wIdx - firstDayWeekday) + 1));
                  const targetDateStr =
                    firstSlotDate ||
                    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
                      estimatedDay
                    ).padStart(2, '0')}`;

                  return (
                    <div
                      key={`week-col-${weekdayName}`}
                      onMouseDown={(e) => {
                        if (e.button === 0 && targetDateStr) {
                          startHold(`week-${wIdx}`, targetDateStr);
                        }
                      }}
                      onMouseUp={cancelHold}
                      onMouseLeave={cancelHold}
                      onTouchStart={() => {
                        if (targetDateStr) startHold(`week-${wIdx}`, targetDateStr);
                      }}
                      onTouchEnd={cancelHold}
                      onTouchCancel={cancelHold}
                      title={`Week ${selectedWeekIndex} ${weekdayName} (${targetDateStr}) · Click & hold to allot duty`}
                      className="bg-[#F9FCFB] rounded-2xl border border-[#E2EFEB] p-3 flex flex-col justify-between min-h-[300px] relative select-none hover:border-[#2B8274]/50 transition-colors"
                    >
                      {/* Click-and-Hold Progress Feedback Overlay */}
                      {holdingCellKey === `week-${wIdx}` && (
                        <div className="absolute inset-0 bg-[#0F4C42]/10 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center z-30 pointer-events-none transition-all animate-fadeIn">
                          <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-[#0F4C42] relative animate-pulse">
                            <Plus className="w-5 h-5 text-[#0F4C42]" />
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke="currentColor"
                                strokeWidth="3"
                                className="text-[#2B8274]"
                                fill="transparent"
                                strokeDasharray="100"
                                strokeDashoffset={100 - holdProgress}
                              />
                            </svg>
                          </div>
                          <span className="text-[10px] font-bold text-[#0A3A33] mt-1 bg-white/95 px-2 py-0.5 rounded-full shadow-xs border border-[#D5E8E3]">
                            Hold to Allot Duty...
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between border-b border-[#E2EFEB] pb-2 mb-2">
                          <span className="font-extrabold text-xs text-[#0A3A33]">
                            {weekdayName}
                          </span>
                          <span className="text-[10px] text-[#719B93]">
                            {targetDateStr.slice(5)}
                          </span>
                        </div>

                        {weekSlots.length === 0 ? (
                          <div className="py-8 text-center text-[11px] text-[#9BB6B0] italic">
                            No satsangs scheduled
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {weekSlots.map((slot) => {
                              const duty = slot.existingDuty;
                              const pr = duty?.pracharakId
                                ? pracharaks.find((p) => p.id === duty.pracharakId)
                                : null;

                              return (
                                <div
                                  key={`${slot.date}-${slot.branch.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEventForDetail({ slot, duty });
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onTouchStart={(e) => e.stopPropagation()}
                                  className="p-2 bg-white rounded-xl border border-[#D5E8E3] shadow-2xs hover:shadow-xs transition-shadow cursor-pointer space-y-1"
                                >
                                  <div className="flex items-center justify-between text-[10px] text-[#719B93]">
                                    <span className="font-mono">{slot.satsang.time.split(' - ')[0]}</span>
                                    <span className="font-bold text-[#0A3A33]">{slot.branch.code}</span>
                                  </div>

                                  <p className="font-bold text-xs text-[#0A3A33] leading-tight">
                                    {duty?.type === 'vichar'
                                      ? 'Satguru Mata Ji Vichar'
                                      : duty?.type === 'local'
                                      ? duty.localPracharakName
                                      : pr?.name || 'Unassigned'}
                                  </p>

                                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                                    <span className="text-[#4A726B] truncate max-w-[100px]">
                                      {slot.branch.name}
                                    </span>
                                    {duty && (
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-bold ${
                                          duty.approvalStatus === 'APPROVED'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {duty.approvalStatus}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAllot(targetDateStr);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="mt-3 w-full py-1.5 rounded-xl border border-dashed border-[#B8D8D0] hover:bg-[#E3F8AC] hover:border-[#0F4C42] text-[11px] font-bold text-[#0F4C42] transition-colors"
                      >
                        + Allot (or hold)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. DAY VIEW (Focused Agenda for Selected Day) */}
          {/* ========================================================================= */}
          {viewMode === 'day' && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2EFEB] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#0A3A33]">
                    {selectedYear}-{String(selectedMonth).padStart(2, '0')}-{String(
                      selectedDayNumber
                    ).padStart(2, '0')}
                  </h3>
                  <p className="text-xs text-[#4A726B]">
                    Full congregation duty agenda across all Pune branches
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDayNumber(Math.max(1, selectedDayNumber - 1))}
                    className="p-1.5 bg-[#F0F7F5] rounded-lg text-[#0A3A33]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-[#0A3A33]">Day {selectedDayNumber}</span>
                  <button
                    onClick={() =>
                      setSelectedDayNumber(Math.min(daysInMonth, selectedDayNumber + 1))
                    }
                    className="p-1.5 bg-[#F0F7F5] rounded-lg text-[#0A3A33]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Agenda Cards */}
              <div className="space-y-3">
                {(slotsByDay[selectedDayNumber] || []).length === 0 ? (
                  <div className="p-8 text-center bg-[#F9FCFB] rounded-2xl border border-dashed border-[#D5E8E3]">
                    <p className="text-sm font-bold text-[#4A726B]">
                      No Satsangs scheduled on this date
                    </p>
                    <p className="text-xs text-[#719B93] mt-1">
                      Regular Sunday and Wednesday schedules may not fall on this day.
                    </p>
                    <button
                      onClick={() =>
                        handleOpenAllot(
                          `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
                            selectedDayNumber
                          ).padStart(2, '0')}`
                        )
                      }
                      className="mt-3 px-4 py-1.5 bg-[#0F4C42] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
                      <span>Allot Satsang Duty for This Day</span>
                    </button>
                  </div>
                ) : (
                  (slotsByDay[selectedDayNumber] || []).map((slot) => {
                    const duty = slot.existingDuty;
                    const pr = duty?.pracharakId
                      ? pracharaks.find((p) => p.id === duty.pracharakId)
                      : null;

                    return (
                      <div
                        key={`${slot.date}-${slot.branch.id}`}
                        onClick={() => setSelectedEventForDetail({ slot, duty })}
                        className="p-4 bg-[#F9FCFB] hover:bg-white rounded-2xl border border-[#E2EFEB] hover:border-[#2B8274] transition-all cursor-pointer shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#0F4C42] text-white flex flex-col items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-[#D4F58C]" />
                            <span className="text-[10px] font-mono mt-0.5">
                              {slot.satsang.time.split(' - ')[0]}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-[#0A3A33]">
                                {slot.branch.name} ({slot.branch.code})
                              </h4>
                              <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                                {slot.satsang.category}
                              </span>
                            </div>

                            <p className="text-xs text-[#4A726B] mt-0.5 flex items-center gap-2">
                              <span>Location: {slot.branch.satsangBhavan}</span>
                              <span>·</span>
                              <span>Mukhi: {slot.branch.mukhiName}</span>
                            </p>

                            <div className="mt-2 inline-flex items-center gap-2 text-xs">
                              <span className="text-[#719B93]">Allocated:</span>
                              <strong className="text-[#0A3A33]">
                                {duty?.type === 'vichar'
                                  ? 'Satguru Mata Ji Vichar (Video Broadcast)'
                                  : duty?.type === 'local'
                                  ? `${duty.localPracharakName} (Local Branch Preacher)`
                                  : duty?.type === 'other_zone'
                                  ? `${duty.otherZoneDetails} (Other Zone Preacher)`
                                  : pr
                                  ? `${pr.name} (Category ${pr.category})`
                                  : 'Not yet allocated'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {duty && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttendanceModalDuty(duty);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                duty.attendance === 'PRESENT'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              Attendance: {duty.attendance}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAllot(slot.date, slot.branch, slot.satsang, duty);
                            }}
                            className="px-3 py-1.5 bg-[#E3F8AC] hover:bg-[#d5f096] text-[#0A3A33] rounded-xl text-xs font-bold"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. TABLE MATRIX VIEW (Spreadsheet view) */}
          {/* ========================================================================= */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                    <th className="py-3 px-4 w-28">Date</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 w-28">Time</th>
                    <th className="py-3 px-4">Duty / Preacher</th>
                    <th className="py-3 px-4 w-28">Approval</th>
                    <th className="py-3 px-4 w-28">Attendance</th>
                    <th className="py-3 px-4 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF4F2]">
                  {filteredSlots.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#719B93]">
                        No duties found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSlots.map((slot) => {
                      const duty = slot.existingDuty;
                      const pr = duty?.pracharakId
                        ? pracharaks.find((p) => p.id === duty.pracharakId)
                        : null;

                      return (
                        <tr
                          key={`${slot.date}-${slot.branch.id}-${slot.satsang.id}`}
                          className="hover:bg-[#F9FCFB] transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-[#0A3A33]">
                            <div>{slot.date}</div>
                            <div className="text-[10px] text-[#719B93] font-normal">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.weekday]} · Wk{' '}
                              {slot.weekNumber}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0A3A33]">{slot.branch.name}</div>
                            <div className="text-[10px] text-[#719B93]">{slot.branch.code}</div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[#4A726B]">
                            {slot.satsang.time}
                          </td>

                          <td className="py-3 px-4">
                            {duty?.type === 'vichar' ? (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                <Video className="w-3 h-3 text-emerald-600" />
                                <span>Satguru Mata Ji Vichar</span>
                              </span>
                            ) : duty?.type === 'local' ? (
                              <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                {duty.localPracharakName} (Local)
                              </span>
                            ) : duty?.type === 'other_zone' ? (
                              <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                                {duty.otherZoneDetails} (Other Zone)
                              </span>
                            ) : pr ? (
                              <div>
                                <span className="font-bold text-[#0A3A33]">{pr.name}</span>
                                <span className="ml-1.5 text-[10px] bg-[#F0F7F5] border border-[#D5E8E3] px-1.5 py-0.2 rounded font-mono font-bold">
                                  {pr.category}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Unfilled</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {duty ? (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  duty.approvalStatus === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : duty.approvalStatus === 'PENDING'
                                    ? 'bg-amber-100 text-amber-900 animate-pulse'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {duty.approvalStatus}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {duty && (
                              <button
                                onClick={() => setAttendanceModalDuty(duty)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                                  duty.attendance === 'PRESENT'
                                    ? 'bg-[#E3F8AC] text-[#0A3A33]'
                                    : duty.attendance === 'ABSENT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{duty.attendance}</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() =>
                                handleOpenAllot(slot.date, slot.branch, slot.satsang, duty)
                              }
                              className="px-2.5 py-1 bg-[#F0F7F5] hover:bg-[#E3F8AC] text-[#0A3A33] rounded-lg text-xs font-bold transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OUTLOOK-STYLE EVENT DETAIL & ACTION POPOVER */}
      {/* ========================================================================= */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#E2EFEB] shadow-2xl space-y-4 animate-scaleUp">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#719B93]">
                  Duty Allocation Details
                </span>
                <h3 className="text-lg font-extrabold text-[#0A3A33]">
                  {selectedEventForDetail.duty?.type === 'vichar'
                    ? 'Satguru Mata Ji Vichar (Video Broadcast)'
                    : selectedEventForDetail.duty?.type === 'local'
                    ? selectedEventForDetail.duty.localPracharakName
                    : selectedEventForDetail.duty?.type === 'other_zone'
                    ? selectedEventForDetail.duty.otherZoneDetails
                    : pracharaks.find(
                        (p) => p.id === selectedEventForDetail.duty?.pracharakId
                      )?.name || 'Unallocated Satsang'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time & Location Bar */}
            <div className="p-3 bg-[#F0F7F5] rounded-2xl flex items-center justify-between text-xs text-[#0F4C42]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2B8274]" />
                <span className="font-mono font-bold">
                  {selectedEventForDetail.slot.date} · {selectedEventForDetail.slot.satsang.time}
                </span>
              </div>
              <span className="font-bold bg-white px-2 py-0.5 rounded-lg border border-[#D5E8E3]">
                Week {selectedEventForDetail.slot.weekNumber}
              </span>
            </div>

            {/* Preacher Info */}
            {selectedEventForDetail.duty?.pracharakId && (
              <div className="p-3 border border-[#E2EFEB] rounded-2xl space-y-2 text-xs">
                {(() => {
                  const pr = pracharaks.find(
                    (p) => p.id === selectedEventForDetail.duty?.pracharakId
                  );
                  if (!pr) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#0A3A33]">{pr.name}</span>
                        <span className="px-2 py-0.5 bg-[#E3F8AC] text-[#0A3A33] rounded-md font-bold text-[10px]">
                          Category {pr.category}
                        </span>
                      </div>
                      <p className="text-[#4A726B] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2B8274]" />
                        <span>{pr.phone}</span>
                        <span>·</span>
                        <span>{pr.residenceAddress}</span>
                      </p>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Branch & Mukhi Info */}
            <div className="p-3 border border-[#E2EFEB] rounded-2xl space-y-1 text-xs text-[#4A726B]">
              <p className="font-bold text-[#0A3A33] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#2B8274]" />
                <span>
                  {selectedEventForDetail.slot.branch.name} ({selectedEventForDetail.slot.branch.code})
                </span>
              </p>
              <p>Location: {selectedEventForDetail.slot.branch.satsangBhavan}</p>
              <p>
                Branch Mukhi: {selectedEventForDetail.slot.branch.mukhiName} (
                {selectedEventForDetail.slot.branch.mukhiContact})
              </p>
            </div>

            {/* Status & Attendance Badges */}
            {selectedEventForDetail.duty && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Approval
                  </span>
                  <span className="font-bold text-[#0A3A33]">
                    {selectedEventForDetail.duty.approvalStatus}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">
                    Attendance
                  </span>
                  <span className="font-bold text-[#0A3A33]">
                    {selectedEventForDetail.duty.attendance}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAttendanceModalDuty(selectedEventForDetail.duty!);
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#0A3A33] shadow-2xs"
                >
                  Mark Attendance
                </button>
              </div>
            )}

            {/* Actions: Edit / Reassign, Delete */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2EFEB]">
              {selectedEventForDetail.duty && isZoneAdmin ? (
                <button
                  onClick={() => handleDeleteCurrentDuty(selectedEventForDetail.duty!.id)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Duty</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventForDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const { slot, duty } = selectedEventForDetail;
                    setSelectedEventForDetail(null);
                    handleOpenAllot(slot.date, slot.branch, slot.satsang, duty);
                  }}
                  className="px-4 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#D4F58C]" />
                  <span>Edit / Reassign</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OUTLOOK-STYLE "ALLOT DUTY" MODAL (Create/Edit Allocation) */}
      {/* ========================================================================= */}
      {isAllotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-[#E2EFEB] shadow-2xl space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E2EFEB] pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#0A3A33]">
                  Allot Congregation Duty
                </h3>
                <p className="text-xs text-[#4A726B]">
                  Schedule a preacher or broadcast for Zone 34 congregation
                </p>
              </div>
              <button
                onClick={() => setIsAllotModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message if any */}
            {allotFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{allotFormError}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              {/* Date & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A3A33] mb-1">
                    Satsang Date
                  </label>
                  <input
                    type="date"
                    value={allotFormDate}
                    onChange={(e) => setAllotFormDate(e.target.value)}
                    className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-2 text-xs text-[#0A3A33] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0A3A33] mb-1">
                    Branch / Sangat
                  </label>
                  <select
                    value={allotFormBranchId}
                    onChange={(e) => {
                      const newBranchId = e.target.value;
                      setAllotFormBranchId(newBranchId);
                      const matchingSatsang = satsangs.find((s) => s.branchId === newBranchId);
                      if (matchingSatsang) {
                        setAllotFormSatsangId(matchingSatsang.id);
                      }
                    }}
                    disabled={!isZoneAdmin}
                    className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none font-medium"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Satsang Session */}
              <div>
                <label className="block text-[11px] font-bold text-[#0A3A33] mb-1">
                  Satsang Session Timing
                </label>
                <select
                  value={allotFormSatsangId}
                  onChange={(e) => setAllotFormSatsangId(e.target.value)}
                  className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none font-medium"
                >
                  {satsangs
                    .filter((s) => s.branchId === allotFormBranchId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} · {s.time} ({s.category})
                      </option>
                    ))}
                </select>
              </div>

              {/* Duty Type Picker */}
              <div>
                <label className="block text-[11px] font-bold text-[#0A3A33] mb-1.5">
                  Allocation Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllotFormDutyType('pracharak')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      allotFormDutyType === 'pracharak'
                        ? 'bg-[#0F4C42] text-white border-[#0F4C42] shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Pracharak
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllotFormDutyType('vichar')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      allotFormDutyType === 'vichar'
                        ? 'bg-[#82C341] text-[#0A3A33] border-[#82C341] shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Satguru Vichar
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllotFormDutyType('local')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      allotFormDutyType === 'local'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Local Preacher
                  </button>

                  <button
                    type="button"
                    onClick={() => setAllotFormDutyType('other_zone')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      allotFormDutyType === 'other_zone'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Other Zone
                  </button>
                </div>
              </div>

              {/* Conditional Form Inputs */}
              {allotFormDutyType === 'pracharak' && (
                <div className="space-y-2 p-3 bg-[#F9FCFB] rounded-2xl border border-[#E2EFEB]">
                  <label className="block text-[11px] font-bold text-[#0A3A33]">
                    Select Zone 34 Pracharak
                  </label>
                  <select
                    value={allotFormPracharakId}
                    onChange={(e) => setAllotFormPracharakId(e.target.value)}
                    className="w-full bg-white border border-[#D5E8E3] rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none font-medium"
                  >
                    <option value="">-- Choose Preacher --</option>
                    {pracharaks.map((p) => {
                      const onHold = isPracharakOnHold(p.id, allotFormDate);
                      const dutiesThisMonth = dutyAllocations.filter((d) => {
                        const dt = new Date(d.date);
                        return (
                          d.pracharakId === p.id &&
                          dt.getFullYear() === selectedYear &&
                          dt.getMonth() + 1 === selectedMonth
                        );
                      }).length;

                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} · Cat {p.category} ({dutiesThisMonth} duties this mo)
                          {onHold ? ' [ON HOLD / LEAVE]' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {allotFormPracharakId && isPracharakOnHold(allotFormPracharakId, allotFormDate) && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Warning: This Pracharak has an active hold/leave on this date.</span>
                    </div>
                  )}
                </div>
              )}

              {allotFormDutyType === 'local' && (
                <div className="space-y-2 p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <label className="block text-[11px] font-bold text-amber-950">
                    Local Preacher Full Name & Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sister Meena Joshi (Pimpri)"
                    value={allotFormLocalName}
                    onChange={(e) => setAllotFormLocalName(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-800">
                    Will be routed for Zone Admin approval if required by rule settings.
                  </p>
                </div>
              )}

              {allotFormDutyType === 'other_zone' && (
                <div className="space-y-2 p-3 bg-purple-50/50 rounded-2xl border border-purple-200">
                  <label className="block text-[11px] font-bold text-purple-950">
                    Other-Zone Preacher & Origin Zone Details
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rev. K. S. Bedi (Zone 11, Delhi)"
                    value={allotFormOtherZone}
                    onChange={(e) => setAllotFormOtherZone(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none"
                  />
                  <p className="text-[10px] text-purple-800">
                    Requires Zone Admin approval prior to final publishing.
                  </p>
                </div>
              )}

              {/* Override Reason (Admin Only) */}
              {isZoneAdmin && (
                <div>
                  <label className="block text-[11px] font-bold text-[#4A726B] mb-1">
                    Rule Override Reason (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Explain reason if bypassing category limits or holds"
                    value={allotFormOverrideReason}
                    onChange={(e) => setAllotFormOverrideReason(e.target.value)}
                    className="w-full bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-2 text-xs text-[#0A3A33] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2EFEB]">
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAllotment}
                className="px-5 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Allocate Rules Modal */}
      {isAutoModalOpen && (
        <AutoAllocateModal
          isOpen={isAutoModalOpen}
          onClose={() => setIsAutoModalOpen(false)}
        />
      )}

      {/* Attendance & Substitute Performer Modal */}
      {attendanceModalDuty && (
        <AttendanceFeedbackModal
          duty={attendanceModalDuty}
          isOpen={!!attendanceModalDuty}
          onClose={() => setAttendanceModalDuty(null)}
        />
      )}

      {/* Official PDF Duty Chart Exporter Modal (with Devanagari Hindi/Marathi support) */}
      {isPdfModalOpen && (
        <PdfDutyChartModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          defaultMonthName={monthName}
        />
      )}
    </div>
  );
};

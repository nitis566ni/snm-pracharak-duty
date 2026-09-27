import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Sector,
  Branch,
  Designation,
  Pracharak,
  PracharakHold,
  Satsang,
  SpecialDay,
  DutyAllocation,
  DutyFreeze,
  AppSettings,
  ReportSettings,
  AuditLog,
  Language,
  BulkUploadRow,
  DutyType,
  AttendanceStatus,
  ApprovalStatus,
  ThemeName,
  FontSizeName,
} from '../types';
import {
  initialUsers,
  initialSectors,
  initialBranches,
  initialDesignations,
  initialPracharaks,
  initialHolds,
  initialSpecialDays,
  initialSatsangs,
  initialAppSettings,
  initialReportSettings,
  initialFreezes,
  initialDuties,
  initialAuditLogs,
} from '../data/mockData';
import { translations, getTranslation } from '../i18n/translations';

interface AppContextType {
  // Current user & role
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  isZoneAdmin: boolean;
  userBranch?: Branch;

  // Language & i18n
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRightDrawerOpen: boolean;
  setIsRightDrawerOpen: (open: boolean) => void;
  isApprovalsDrawerOpen: boolean;
  setIsApprovalsDrawerOpen: (open: boolean) => void;

  // Appearance & Themes
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  fontSize: FontSizeName;
  setFontSize: (fontSize: FontSizeName) => void;

  // Selected date scope
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedMonth: number; // 1-12
  setSelectedMonth: (m: number) => void;
  isMonthFrozen: boolean;
  currentMonthFreeze?: DutyFreeze;

  // Master Data
  sectors: Sector[];
  branches: Branch[];
  designations: Designation[];
  pracharaks: Pracharak[];
  holds: PracharakHold[];
  specialDays: SpecialDay[];
  satsangs: Satsang[];
  appSettings: AppSettings;
  reportSettings: ReportSettings;
  dutyAllocations: DutyAllocation[];
  dutyFreezes: DutyFreeze[];
  auditLogs: AuditLog[];

  // Allocation & Management Actions
  allocateDuty: (params: {
    satsangDateId?: string;
    date: string;
    branchId: string;
    satsangId: string;
    type: DutyType;
    pracharakId?: string;
    localPracharakName?: string;
    otherZoneDetails?: string;
    overrideReason?: string;
  }) => { success: boolean; message?: string };

  deleteDuty: (dutyId: string) => { success: boolean; message?: string };
  freezeCurrentMonth: () => void;
  unfreezeCurrentMonth: () => void;
  toggleMonthFreeze: (year: number, month: number) => void;
  approveDuty: (dutyId: string, notes?: string) => void;
  rejectDuty: (dutyId: string, notes?: string) => void;
  approveAllPending: () => void;
  markAttendance: (
    dutyId: string,
    attendance: AttendanceStatus,
    actualPerformer?: string,
    feedback?: string
  ) => void;
  runAutoAllocation: (year: number, month: number) => { count: number; vicharCount: number };
  applyBulkImport: (rows: BulkUploadRow[]) => { added: number; updated: number };

  // User management (screenshot 16)
  saveUser: (user: Partial<User>) => void;
  toggleUserActive: (userId: string) => void;
  deleteUser: (userId: string) => void;

  // Masters CRUD
  saveSector: (sector: Partial<Sector>) => void;
  deleteSector: (id: string) => void;
  saveBranch: (branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  savePracharak: (pracharak: Partial<Pracharak>) => void;
  deletePracharak: (id: string) => void;
  saveDesignation: (des: Partial<Designation>) => void;
  deleteDesignation: (id: string) => void;
  saveSatsang: (satsang: Partial<Satsang>) => void;
  deleteSatsang: (id: string) => void;
  saveHold: (hold: Partial<PracharakHold>) => void;
  deleteHold: (id: string) => void;
  saveSpecialDay: (sp: Partial<SpecialDay>) => void;
  deleteSpecialDay: (id: string) => void;
  saveAppSettings: (settings: AppSettings) => void;
  saveReportSettings: (settings: ReportSettings) => void;

  // Helper selectors
  isPracharakOnHold: (pracharakId: string, dateStr: string) => boolean;
  getSatsangDatesForMonth: (year: number, month: number, branchId?: string) => {
    date: string;
    weekday: number;
    weekNumber: number;
    branch: Branch;
    satsang: Satsang;
    isVisheshDin: boolean;
    visheshDinName?: string;
    existingDuty?: DutyAllocation;
  }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or seed defaults
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('snm_user_id');
    const found = initialUsers.find((u) => u.id === saved);
    return found || initialUsers[0]; // Default to Zone Admin
  });

  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('snm_lang') as Language;
    return saved && ['en', 'hi', 'mr'].includes(saved) ? saved : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('snm_lang', newLang);
  };

  const t = (key: keyof typeof translations.en) => getTranslation(key, lang);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(true);
  const [isApprovalsDrawerOpen, setIsApprovalsDrawerOpen] = useState<boolean>(false);

  // Appearance & Themes
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('snm_theme') as ThemeName;
    return saved && ['mint', 'ocean', 'amber', 'purple', 'forest'].includes(saved) ? saved : 'mint';
  });

  const [fontSize, setFontSizeState] = useState<FontSizeName>(() => {
    const saved = localStorage.getItem('snm_font_size') as FontSizeName;
    return saved && ['compact', 'normal', 'medium', 'large', 'xlarge'].includes(saved) ? saved : 'normal';
  });

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('snm_theme', newTheme);
  };

  const setFontSize = (newSize: FontSizeName) => {
    setFontSizeState(newSize);
    localStorage.setItem('snm_font_size', newSize);
  };

  useEffect(() => {
    document.documentElement.className = `font-size-${fontSize} theme-${theme}`;
  }, [theme, fontSize]);

  // Default to October 2026 (target scheduling period as per current date Sep 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);

  // Core Data States
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [designations, setDesignations] = useState<Designation[]>(initialDesignations);
  const [pracharaks, setPracharaks] = useState<Pracharak[]>(initialPracharaks);
  const [holds, setHolds] = useState<PracharakHold[]>(initialHolds);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>(initialSpecialDays);
  const [satsangs, setSatsangs] = useState<Satsang[]>(initialSatsangs);
  const [appSettings, setAppSettings] = useState<AppSettings>(initialAppSettings);
  const [reportSettings, setReportSettings] = useState<ReportSettings>(initialReportSettings);
  const [dutyFreezes, setDutyFreezes] = useState<DutyFreeze[]>(initialFreezes);
  const [dutyAllocations, setDutyAllocations] = useState<DutyAllocation[]>(initialDuties);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Sync user selection
  useEffect(() => {
    localStorage.setItem('snm_user_id', currentUser.id);
  }, [currentUser]);

  const isZoneAdmin = currentUser.role === 'ZONE_ADMIN';
  const userBranch = branches.find((b) => b.id === currentUser.branchId);

  // Check if current selected month is frozen
  const currentMonthFreeze = useMemo(() => {
    return dutyFreezes.find(
      (f) => f.year === selectedYear && f.month === selectedMonth && f.isFrozen
    );
  }, [dutyFreezes, selectedYear, selectedMonth]);

  const isMonthFrozen = !!currentMonthFreeze;

  const addAudit = (
    entityType: AuditLog['entityType'],
    entityId: string,
    action: AuditLog['action'],
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      entityType,
      entityId,
      action,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const isPracharakOnHold = (pracharakId: string, dateStr: string): boolean => {
    const targetTime = new Date(dateStr).getTime();
    return holds.some((h) => {
      if (h.pracharakId !== pracharakId) return false;
      const start = new Date(h.fromDate).getTime();
      const end = new Date(h.toDate).getTime();
      return targetTime >= start && targetTime <= end;
    });
  };

  // Generate satsang occurrences for a given month & branch
  const getSatsangDatesForMonth = (year: number, month: number, targetBranchId?: string) => {
    const list: any[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    const filteredBranches = targetBranchId
      ? branches.filter((b) => b.id === targetBranchId && b.active)
      : branches.filter((b) => b.active);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day);
      const weekday = dateObj.getDay();
      const yyyy = year;
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // Calculate occurrence of this weekday in the month (weekNumber: 1, 2, 3, 4, 5)
      const weekNumber = Math.ceil(day / 7);

      // Check Vishesh Din
      const visheshDin = specialDays.find((sp) => {
        if (!sp.active) return false;
        return dateStr >= sp.startDate && dateStr <= sp.endDate;
      });

      filteredBranches.forEach((branch) => {
        const branchSatsangs = satsangs.filter(
          (s) => s.branchId === branch.id && s.weekday === weekday && s.active
        );

        branchSatsangs.forEach((sat) => {
          // Check skip mode
          if (sat.skipMode === 'ALTERNATE' && weekNumber % 2 === 0) return;
          if (sat.skipMode === 'FIRST_WEEK_ONLY' && weekNumber !== 1) return;
          if (sat.skipMode === 'LAST_WEEK_ONLY') {
            const isLast = day + 7 > daysInMonth;
            if (!isLast) return;
          }

          const existingDuty = dutyAllocations.find(
            (d) => d.date === dateStr && d.branchId === branch.id && d.satsangId === sat.id
          );

          list.push({
            date: dateStr,
            weekday,
            weekNumber,
            branch,
            satsang: sat,
            isVisheshDin: !!visheshDin,
            visheshDinName: visheshDin?.name,
            existingDuty,
          });
        });
      });
    }

    return list;
  };

  // Duty Allocation Handler with strict RBAC & Rule Checks
  const allocateDuty = (params: {
    satsangDateId?: string;
    date: string;
    branchId: string;
    satsangId: string;
    type: DutyType;
    pracharakId?: string;
    localPracharakName?: string;
    otherZoneDetails?: string;
    overrideReason?: string;
  }): { success: boolean; message?: string } => {
    // 1. Check Freeze
    const dutyDate = new Date(params.date);
    const yr = dutyDate.getFullYear();
    const mo = dutyDate.getMonth() + 1;
    const isFrozen = dutyFreezes.some((f) => f.year === yr && f.month === mo && f.isFrozen);
    if (isFrozen) {
      return { success: false, message: 'This month is published and frozen. Edits are locked.' };
    }

    // 2. Check RBAC
    if (!isZoneAdmin) {
      if (currentUser.branchId !== params.branchId) {
        return { success: false, message: 'Unauthorized. You can only allocate duties for your branch.' };
      }
      // Check permitted weeks
      const day = dutyDate.getDate();
      const weekNumber = Math.ceil(day / 7);
      if (!appSettings.mukhiFillableWeeks.includes(weekNumber)) {
        return {
          success: false,
          message: `Branch Mukhi is only permitted to fill duties during weeks: ${appSettings.mukhiFillableWeeks.join(', ')}. Week ${weekNumber} is restricted.`,
        };
      }
    }

    // 3. Check Pracharak Holds
    if (params.pracharakId && isPracharakOnHold(params.pracharakId, params.date)) {
      if (!params.overrideReason) {
        const pr = pracharaks.find((p) => p.id === params.pracharakId);
        return {
          success: false,
          message: `${pr?.name || 'Selected Pracharak'} is on HOLD (unavailable) on ${params.date}. Admin override reason required.`,
        };
      }
    }

    // Determine Approval Status
    let approvalStatus: ApprovalStatus = 'APPROVED';
    if (params.type === 'local' && appSettings.requireLocalApproval && !isZoneAdmin) {
      approvalStatus = 'PENDING';
    } else if (params.type === 'other_zone' && appSettings.requireOtherZoneApproval && !isZoneAdmin) {
      approvalStatus = 'PENDING';
    }

    // Update or Insert Allocation
    const existingIndex = dutyAllocations.findIndex(
      (d) => d.date === params.date && d.branchId === params.branchId && d.satsangId === params.satsangId
    );

    const newDuty: DutyAllocation = {
      id: existingIndex >= 0 ? dutyAllocations[existingIndex].id : `dt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      satsangDateId: params.satsangDateId || `sd-${params.date}-${params.branchId}`,
      date: params.date,
      branchId: params.branchId,
      satsangId: params.satsangId,
      type: params.type,
      pracharakId: params.pracharakId,
      localPracharakName: params.localPracharakName,
      otherZoneDetails: params.otherZoneDetails,
      approvalStatus,
      attendance: existingIndex >= 0 ? dutyAllocations[existingIndex].attendance : 'UNMARKED',
      actualPerformer: existingIndex >= 0 ? dutyAllocations[existingIndex].actualPerformer : undefined,
      feedback: existingIndex >= 0 ? dutyAllocations[existingIndex].feedback : undefined,
      overrideReason: params.overrideReason,
      allocatedBy: `${currentUser.name} (${isZoneAdmin ? 'Zone Admin' : 'Branch Mukhi'})`,
      allocatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      setDutyAllocations((prev) => {
        const clone = [...prev];
        clone[existingIndex] = newDuty;
        return clone;
      });
      addAudit('DUTY', newDuty.id, 'UPDATE', `Updated duty on ${params.date} to ${params.type}`);
    } else {
      setDutyAllocations((prev) => [newDuty, ...prev]);
      addAudit('DUTY', newDuty.id, 'CREATE', `Allocated duty on ${params.date} (${params.type})`);
    }

    return { success: true };
  };

  const deleteDuty = (dutyId: string) => {
    if (isMonthFrozen && !isZoneAdmin) {
      return { success: false, message: 'Month is frozen. Cannot delete duty.' };
    }
    const found = dutyAllocations.find((d) => d.id === dutyId);
    if (!found) return { success: false, message: 'Duty not found.' };

    if (!isZoneAdmin && found.branchId !== currentUser.branchId) {
      return { success: false, message: 'Unauthorized.' };
    }

    setDutyAllocations((prev) => prev.filter((d) => d.id !== dutyId));
    addAudit('DUTY', dutyId, 'DELETE', `Removed duty allocation for ${found.date}`);
    return { success: true };
  };

  const freezeCurrentMonth = () => {
    if (!isZoneAdmin) return;
    const newFreeze: DutyFreeze = {
      id: `frz-${selectedYear}-${selectedMonth}`,
      year: selectedYear,
      month: selectedMonth,
      isFrozen: true,
      frozenBy: `${currentUser.name} (Zone Admin)`,
      frozenAt: new Date().toISOString(),
    };
    setDutyFreezes((prev) => [newFreeze, ...prev.filter((f) => !(f.year === selectedYear && f.month === selectedMonth))]);
    addAudit('FREEZE', newFreeze.id, 'FREEZE', `Published and frozen duty chart for ${selectedYear}-${selectedMonth}`);
  };

  const unfreezeCurrentMonth = () => {
    if (!isZoneAdmin) return;
    setDutyFreezes((prev) => prev.filter((f) => !(f.year === selectedYear && f.month === selectedMonth)));
    addAudit('FREEZE', `unfreeze-${selectedYear}-${selectedMonth}`, 'UNFREEZE', `Unfroze duty chart for ${selectedYear}-${selectedMonth}`);
  };

  const toggleMonthFreeze = (year: number, month: number) => {
    if (!isZoneAdmin) return;
    const existing = dutyFreezes.find((f) => f.year === year && f.month === month && f.isFrozen);
    if (existing) {
      setDutyFreezes((prev) => prev.filter((f) => !(f.year === year && f.month === month)));
      addAudit('FREEZE', `unfreeze-${year}-${month}`, 'UNFREEZE', `Unfroze duty chart for ${year}-${month}`);
    } else {
      const newFreeze: DutyFreeze = {
        id: `frz-${year}-${month}`,
        year,
        month,
        isFrozen: true,
        frozenBy: currentUser.email || currentUser.name,
        frozenAt: new Date().toISOString(),
      };
      setDutyFreezes((prev) => [...prev.filter((f) => !(f.year === year && f.month === month)), newFreeze]);
      addAudit('FREEZE', newFreeze.id, 'FREEZE', `Published and frozen duty chart for ${year}-${month}`);
    }
  };

  const saveUser = (userData: Partial<User>) => {
    if (userData.id) {
      setUsers((prev) => prev.map((u) => (u.id === userData.id ? ({ ...u, ...userData } as User) : u)));
      addAudit('USER', userData.id, 'UPDATE', `Updated user: ${userData.email}`);
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        email: userData.email || '',
        name: userData.name || userData.email || 'New User',
        role: userData.role || 'BRANCH_MUKHI',
        branchId: userData.branchId,
        active: userData.active ?? true,
        title: userData.title || (userData.role === 'ZONE_ADMIN' ? 'Zone Coordinator' : 'Branch Mukhi'),
        phone: userData.phone || '',
      };
      setUsers((prev) => [...prev, newUser]);
      addAudit('USER', newUser.id, 'CREATE', `Created user account: ${newUser.email}`);
    }
  };

  const toggleUserActive = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedActive = !u.active;
          addAudit('USER', userId, 'UPDATE', `${updatedActive ? 'Activated' : 'Deactivated'} user: ${u.email}`);
          return { ...u, active: updatedActive };
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addAudit('USER', userId, 'DELETE', `Deleted user account`);
  };

  const approveDuty = (dutyId: string, notes?: string) => {
    if (!isZoneAdmin) return;
    setDutyAllocations((prev) =>
      prev.map((d) => (d.id === dutyId ? { ...d, approvalStatus: 'APPROVED', approvalNotes: notes } : d))
    );
    addAudit('DUTY', dutyId, 'UPDATE', 'Zone Admin approved pending duty');
  };

  const rejectDuty = (dutyId: string, notes?: string) => {
    if (!isZoneAdmin) return;
    setDutyAllocations((prev) =>
      prev.map((d) => (d.id === dutyId ? { ...d, approvalStatus: 'REJECTED', approvalNotes: notes } : d))
    );
    addAudit('DUTY', dutyId, 'UPDATE', `Zone Admin rejected duty: ${notes || ''}`);
  };

  const approveAllPending = () => {
    if (!isZoneAdmin) return;
    let count = 0;
    setDutyAllocations((prev) =>
      prev.map((d) => {
        if (d.approvalStatus === 'PENDING') {
          count++;
          return { ...d, approvalStatus: 'APPROVED' };
        }
        return d;
      })
    );
    addAudit('DUTY', 'batch-approval', 'UPDATE', `Zone Admin approved ${count} pending duties`);
  };

  const markAttendance = (
    dutyId: string,
    attendance: AttendanceStatus,
    actualPerformer?: string,
    feedback?: string
  ) => {
    setDutyAllocations((prev) =>
      prev.map((d) => {
        if (d.id !== dutyId) return d;
        return {
          ...d,
          attendance,
          actualPerformer: attendance === 'ABSENT' ? actualPerformer : undefined,
          feedback,
          attendanceMarkedBy: `${currentUser.name} (${isZoneAdmin ? 'Zone Admin' : 'Branch Mukhi'})`,
          attendanceMarkedAt: new Date().toISOString(),
        };
      })
    );
    addAudit('DUTY', dutyId, 'UPDATE', `Marked attendance: ${attendance}`);
  };

  // Rule-based Auto-Allocation Engine
  const runAutoAllocation = (year: number, month: number) => {
    const slots = getSatsangDatesForMonth(year, month);
    let allocatedCount = 0;
    let vicharCount = 0;

    const newDuties: DutyAllocation[] = [...dutyAllocations.filter((d) => {
      const dt = new Date(d.date);
      return !(dt.getFullYear() === year && dt.getMonth() + 1 === month);
    })];

    // Track monthly allocations per pracharak
    const pracharakDutyCount = new Map<string, number>();
    pracharaks.forEach((p) => pracharakDutyCount.set(p.id, 0));

    // Sort pracharaks by category priority: A+, A, B+, B, C
    const availablePracharaks = pracharaks.filter((p) => p.active && p.dutyStatus === 'ELIGIBLE');

    slots.forEach((slot) => {
      // 1. Check Vishesh Din: cancel regular duty
      if (slot.isVisheshDin) {
        newDuties.push({
          id: `dt-auto-${slot.date}-${slot.branch.id}-${slot.satsang.id}`,
          satsangDateId: `sd-${slot.date}-${slot.branch.id}`,
          date: slot.date,
          branchId: slot.branch.id,
          satsangId: slot.satsang.id,
          type: 'no_satsang',
          overrideReason: `Vishesh Din: ${slot.visheshDinName || 'Special Day'}`,
          approvalStatus: 'APPROVED',
          attendance: 'UNMARKED',
          allocatedBy: 'System Auto-Engine (Vishesh Din)',
          allocatedAt: new Date().toISOString(),
        });
        allocatedCount++;
        return;
      }

      // 2. Check Vichar Week (e.g. Week 2)
      if (appSettings.vicharWeeks.includes(slot.weekNumber)) {
        newDuties.push({
          id: `dt-auto-${slot.date}-${slot.branch.id}-${slot.satsang.id}`,
          satsangDateId: `sd-${slot.date}-${slot.branch.id}`,
          date: slot.date,
          branchId: slot.branch.id,
          satsangId: slot.satsang.id,
          type: 'vichar', // Her Holiness Satguru Mata Ji Vichar
          approvalStatus: 'APPROVED',
          attendance: 'UNMARKED',
          allocatedBy: `System Auto-Engine (Vichar Week ${slot.weekNumber})`,
          allocatedAt: new Date().toISOString(),
        });
        vicharCount++;
        allocatedCount++;
        return;
      }

      // 3. Find eligible Pracharak
      // Must match working weekday, not on hold, not assigned to another branch on same date, under category max limit
      const candidates = availablePracharaks.filter((p) => {
        // Must work on this weekday
        if (!p.workingWeekdays.includes(slot.weekday)) return false;
        // Cannot be on hold
        if (isPracharakOnHold(p.id, slot.date)) return false;
        // Cannot already have a duty on this date
        const alreadyAssignedToday = newDuties.some(
          (d) => d.date === slot.date && d.pracharakId === p.id
        );
        if (alreadyAssignedToday) return false;
        // Check category max limit
        const limit = appSettings.categoryLimits.find((c) => c.category === p.category);
        const currentCount = pracharakDutyCount.get(p.id) || 0;
        if (limit && currentCount >= limit.maxDuties) return false;

        return true;
      });

      // Prefer pracharak with least duties allocated so far (even distribution)
      candidates.sort((a, b) => {
        const countA = pracharakDutyCount.get(a.id) || 0;
        const countB = pracharakDutyCount.get(b.id) || 0;
        return countA - countB;
      });

      const selected = candidates[0];

      if (selected) {
        pracharakDutyCount.set(selected.id, (pracharakDutyCount.get(selected.id) || 0) + 1);
        newDuties.push({
          id: `dt-auto-${slot.date}-${slot.branch.id}-${slot.satsang.id}`,
          satsangDateId: `sd-${slot.date}-${slot.branch.id}`,
          date: slot.date,
          branchId: slot.branch.id,
          satsangId: slot.satsang.id,
          type: 'pracharak',
          pracharakId: selected.id,
          approvalStatus: 'APPROVED',
          attendance: 'UNMARKED',
          allocatedBy: 'System Auto-Engine (Rule Optimization)',
          allocatedAt: new Date().toISOString(),
        });
        allocatedCount++;
      } else {
        // Left unfilled for manual intervention
        newDuties.push({
          id: `dt-auto-${slot.date}-${slot.branch.id}-${slot.satsang.id}`,
          satsangDateId: `sd-${slot.date}-${slot.branch.id}`,
          date: slot.date,
          branchId: slot.branch.id,
          satsangId: slot.satsang.id,
          type: 'unfilled',
          approvalStatus: 'APPROVED',
          attendance: 'UNMARKED',
          allocatedBy: 'System Auto-Engine',
          allocatedAt: new Date().toISOString(),
        });
      }
    });

    setDutyAllocations(newDuties);
    addAudit(
      'DUTY',
      `auto-${year}-${month}`,
      'AUTO_ALLOCATE',
      `Auto-allocated ${allocatedCount} duties (${vicharCount} Vichar) for ${year}-${month}`
    );

    return { count: allocatedCount, vicharCount };
  };

  // Bulk Import commit
  const applyBulkImport = (rows: BulkUploadRow[]) => {
    let added = 0;
    let updated = 0;

    rows.forEach((r) => {
      if (r.status === 'ERROR' || !r.approved) return;

      if (r.tab === 'Sectors') {
        const exists = sectors.find((s) => s.code.toUpperCase() === String(r.data.Code).toUpperCase());
        if (exists) {
          setSectors((prev) =>
            prev.map((s) =>
              s.id === exists.id
                ? {
                    ...s,
                    name: r.data.Name || s.name,
                    sanyojakName: r.data.SanyojakName || s.sanyojakName,
                    sanyojakContact: r.data.SanyojakContact || s.sanyojakContact,
                  }
                : s
            )
          );
          updated++;
        } else {
          setSectors((prev) => [
            ...prev,
            {
              id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              code: r.data.Code,
              name: r.data.Name,
              sanyojakName: r.data.SanyojakName || '',
              sanyojakContact: r.data.SanyojakContact || '',
              active: true,
            },
          ]);
          added++;
        }
      } else if (r.tab === 'Branches') {
        const exists = branches.find((b) => b.code.toUpperCase() === String(r.data.Code).toUpperCase());
        if (exists) {
          setBranches((prev) =>
            prev.map((b) =>
              b.id === exists.id
                ? {
                    ...b,
                    name: r.data.Name || b.name,
                    mukhiName: r.data.MukhiName || b.mukhiName,
                    mukhiContact: r.data.MukhiContact || b.mukhiContact,
                    address: r.data.Address || b.address,
                  }
                : b
            )
          );
          updated++;
        } else {
          setBranches((prev) => [
            ...prev,
            {
              id: `br-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              code: r.data.Code,
              name: r.data.Name,
              sectorId: sectors[0]?.id || 'sec-01',
              satsangWeekday: Number(r.data.SatsangWeekday ?? 0),
              registrationStatus: r.data.RegistrationStatus === 'UNREGISTERED' ? 'UNREGISTERED' : 'REGISTERED',
              mukhiName: r.data.MukhiName || '',
              mukhiContact: r.data.MukhiContact || '',
              satsangBhavan: r.data.SatsangBhavan || '',
              address: r.data.Address || '',
              active: true,
            },
          ]);
          added++;
        }
      } else if (r.tab === 'Pracharaks') {
        const exists = pracharaks.find((p) => p.code.toUpperCase() === String(r.data.Code).toUpperCase());
        if (exists) {
          setPracharaks((prev) =>
            prev.map((p) =>
              p.id === exists.id
                ? {
                    ...p,
                    name: r.data.Name || p.name,
                    phone: r.data.Phone || p.phone,
                    category: r.data.Category || p.category,
                    residenceAddress: r.data.ResidenceAddress || p.residenceAddress,
                  }
                : p
            )
          );
          updated++;
        } else {
          setPracharaks((prev) => [
            ...prev,
            {
              id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              code: r.data.Code,
              name: r.data.Name,
              category: r.data.Category || 'B',
              gender: r.data.Gender === 'FEMALE' ? 'FEMALE' : 'MALE',
              age: Number(r.data.Age || 45),
              phone: r.data.Phone || '',
              residenceAddress: r.data.ResidenceAddress || '',
              dutyStatus: 'ELIGIBLE',
              workingWeekdays: [0],
              isGyanPracharak: String(r.data.IsGyanPracharak).toLowerCase() === 'true',
              active: true,
            },
          ]);
          added++;
        }
      }
    });

    addAudit('BULK_UPLOAD', `bulk-${Date.now()}`, 'AUTO_ALLOCATE', `Imported ${added} new records and updated ${updated} records`);
    return { added, updated };
  };

  // Masters CRUD handlers
  const saveSector = (sector: Partial<Sector>) => {
    if (sector.id) {
      setSectors((prev) => prev.map((s) => (s.id === sector.id ? ({ ...s, ...sector } as Sector) : s)));
      addAudit('BRANCH', sector.id, 'UPDATE', `Updated sector: ${sector.name}`);
    } else {
      const newSec: Sector = {
        id: `sec-${Date.now()}`,
        code: sector.code || `SEC-${sectors.length + 1}`,
        name: sector.name || 'New Sector',
        sanyojakName: sector.sanyojakName || '',
        sanyojakContact: sector.sanyojakContact || '',
        active: sector.active ?? true,
      };
      setSectors((prev) => [...prev, newSec]);
      addAudit('BRANCH', newSec.id, 'CREATE', `Created sector: ${newSec.name}`);
    }
  };

  const deleteSector = (id: string) => {
    setSectors((prev) => prev.filter((s) => s.id !== id));
    addAudit('BRANCH', id, 'DELETE', `Deleted sector`);
  };

  const saveBranch = (branch: Partial<Branch>) => {
    if (branch.id) {
      setBranches((prev) => prev.map((b) => (b.id === branch.id ? ({ ...b, ...branch } as Branch) : b)));
      addAudit('BRANCH', branch.id, 'UPDATE', `Updated branch: ${branch.name}`);
    } else {
      const newBr: Branch = {
        id: `br-${Date.now()}`,
        code: branch.code || `PN-0${branches.length + 1}`,
        name: branch.name || 'New Branch',
        sectorId: branch.sectorId || sectors[0]?.id || '',
        satsangWeekday: branch.satsangWeekday ?? 0,
        registrationStatus: branch.registrationStatus || 'REGISTERED',
        parentBranchId: branch.parentBranchId,
        mukhiName: branch.mukhiName || '',
        mukhiContact: branch.mukhiContact || '',
        satsangBhavan: branch.satsangBhavan || '',
        address: branch.address || '',
        active: branch.active ?? true,
      };
      setBranches((prev) => [...prev, newBr]);
      addAudit('BRANCH', newBr.id, 'CREATE', `Created branch: ${newBr.name}`);
    }
  };

  const deleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    addAudit('BRANCH', id, 'DELETE', `Deleted branch`);
  };

  const savePracharak = (pracharak: Partial<Pracharak>) => {
    if (pracharak.id) {
      setPracharaks((prev) => prev.map((p) => (p.id === pracharak.id ? ({ ...p, ...pracharak } as Pracharak) : p)));
      addAudit('PRACHARAK', pracharak.id, 'UPDATE', `Updated pracharak: ${pracharak.name}`);
    } else {
      const newPr: Pracharak = {
        id: `pr-${Date.now()}`,
        code: pracharak.code || `PR-${100 + pracharaks.length + 1}`,
        name: pracharak.name || 'New Pracharak',
        homeBranchId: pracharak.homeBranchId,
        designationId: pracharak.designationId,
        category: pracharak.category || 'B',
        gender: pracharak.gender || 'MALE',
        age: pracharak.age || 40,
        phone: pracharak.phone || '',
        residenceAddress: pracharak.residenceAddress || '',
        dutyStatus: pracharak.dutyStatus || 'ELIGIBLE',
        workingWeekdays: pracharak.workingWeekdays || [0],
        isGyanPracharak: pracharak.isGyanPracharak || false,
        conditionNotes: pracharak.conditionNotes || '',
        active: pracharak.active ?? true,
      };
      setPracharaks((prev) => [...prev, newPr]);
      addAudit('PRACHARAK', newPr.id, 'CREATE', `Created pracharak: ${newPr.name}`);
    }
  };

  const deletePracharak = (id: string) => {
    setPracharaks((prev) => prev.filter((p) => p.id !== id));
    addAudit('PRACHARAK', id, 'DELETE', `Deleted pracharak`);
  };

  const saveDesignation = (des: Partial<Designation>) => {
    if (des.id) {
      setDesignations((prev) => prev.map((d) => (d.id === des.id ? ({ ...d, ...des } as Designation) : d)));
    } else {
      setDesignations((prev) => [
        ...prev,
        {
          id: `des-${Date.now()}`,
          name: des.name || 'New Designation',
          sortOrder: des.sortOrder || designations.length + 1,
          active: des.active ?? true,
        },
      ]);
    }
  };

  const deleteDesignation = (id: string) => {
    setDesignations((prev) => prev.filter((d) => d.id !== id));
  };

  const saveSatsang = (satsang: Partial<Satsang>) => {
    if (satsang.id) {
      setSatsangs((prev) => prev.map((s) => (s.id === satsang.id ? ({ ...s, ...satsang } as Satsang) : s)));
    } else {
      setSatsangs((prev) => [
        ...prev,
        {
          id: `sat-${Date.now()}`,
          branchId: satsang.branchId || branches[0]?.id || '',
          name: satsang.name || 'Regular Sangat',
          weekday: satsang.weekday ?? 0,
          time: satsang.time || '05:30 PM - 07:30 PM',
          location: satsang.location || 'Satsang Hall',
          address: satsang.address || '',
          category: satsang.category || 'Regular Sangat',
          skipMode: satsang.skipMode || 'NONE',
          mukhiFillableWeeks: satsang.mukhiFillableWeeks || [1, 3],
          active: satsang.active ?? true,
        },
      ]);
    }
  };

  const deleteSatsang = (id: string) => {
    setSatsangs((prev) => prev.filter((s) => s.id !== id));
  };

  const saveHold = (hold: Partial<PracharakHold>) => {
    if (hold.id) {
      setHolds((prev) => prev.map((h) => (h.id === hold.id ? ({ ...h, ...hold } as PracharakHold) : h)));
    } else {
      setHolds((prev) => [
        ...prev,
        {
          id: `hld-${Date.now()}`,
          pracharakId: hold.pracharakId || pracharaks[0]?.id || '',
          fromDate: hold.fromDate || new Date().toISOString().split('T')[0],
          toDate: hold.toDate || new Date().toISOString().split('T')[0],
          reason: hold.reason || 'Personal leave',
        },
      ]);
    }
  };

  const deleteHold = (id: string) => {
    setHolds((prev) => prev.filter((h) => h.id !== id));
  };

  const saveSpecialDay = (sp: Partial<SpecialDay>) => {
    if (sp.id) {
      setSpecialDays((prev) => prev.map((s) => (s.id === sp.id ? ({ ...s, ...sp } as SpecialDay) : s)));
    } else {
      setSpecialDays((prev) => [
        ...prev,
        {
          id: `sp-${Date.now()}`,
          name: sp.name || 'Vishesh Din',
          startDate: sp.startDate || new Date().toISOString().split('T')[0],
          endDate: sp.endDate || new Date().toISOString().split('T')[0],
          description: sp.description || '',
          active: sp.active ?? true,
        },
      ]);
    }
  };

  const deleteSpecialDay = (id: string) => {
    setSpecialDays((prev) => prev.filter((s) => s.id !== id));
  };

  const saveAppSettings = (settings: AppSettings) => {
    setAppSettings(settings);
    addAudit('SETTINGS', 'global-rules', 'UPDATE', 'Updated global scheduling & approval rules');
  };

  const saveReportSettings = (settings: ReportSettings) => {
    setReportSettings(settings);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        isZoneAdmin,
        userBranch,
        lang,
        setLang,
        t,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isRightDrawerOpen,
        setIsRightDrawerOpen,
        isApprovalsDrawerOpen,
        setIsApprovalsDrawerOpen,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        selectedYear,
        setSelectedYear,
        selectedMonth,
        setSelectedMonth,
        isMonthFrozen,
        currentMonthFreeze,
        sectors,
        branches,
        designations,
        pracharaks,
        holds,
        specialDays,
        satsangs,
        appSettings,
        reportSettings,
        dutyAllocations,
        dutyFreezes,
        auditLogs,
        allocateDuty,
        deleteDuty,
        freezeCurrentMonth,
        unfreezeCurrentMonth,
        toggleMonthFreeze,
        approveDuty,
        rejectDuty,
        approveAllPending,
        markAttendance,
        runAutoAllocation,
        applyBulkImport,
        saveUser,
        toggleUserActive,
        deleteUser,
        saveSector,
        deleteSector,
        saveBranch,
        deleteBranch,
        savePracharak,
        deletePracharak,
        saveDesignation,
        deleteDesignation,
        saveSatsang,
        deleteSatsang,
        saveHold,
        deleteHold,
        saveSpecialDay,
        deleteSpecialDay,
        saveAppSettings,
        saveReportSettings,
        isPracharakOnHold,
        getSatsangDatesForMonth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

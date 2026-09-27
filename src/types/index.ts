export type UserRole = 'ZONE_ADMIN' | 'BRANCH_MUKHI';

export type Language = 'en' | 'hi' | 'mr';

export type ThemeName = 'mint' | 'ocean' | 'amber' | 'purple' | 'forest';

export type FontSizeName = 'compact' | 'normal' | 'medium' | 'large' | 'xlarge';

export type PracharakCategory = 'A+' | 'A' | 'B+' | 'B' | 'C';

export type DutyStatus = 'ELIGIBLE' | 'ADHIKARI' | 'SEWADAL';

export type DutyType = 'pracharak' | 'vichar' | 'local' | 'other_zone' | 'no_satsang' | 'unfilled';

export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export type AttendanceStatus = 'UNMARKED' | 'PRESENT' | 'ABSENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string; // Mukhi is tied to a specific branch
  active: boolean;
  avatar?: string;
  title?: string;
  phone?: string;
}

export interface Sector {
  id: string;
  code: string;
  name: string;
  sanyojakName: string;
  sanyojakContact: string;
  active: boolean;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  sectorId: string;
  satsangWeekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  registrationStatus: 'REGISTERED' | 'UNREGISTERED'; // Unregistered Prabandhakiya Sangat
  parentBranchId?: string;
  mukhiName: string;
  mukhiContact: string;
  satsangBhavan: string;
  address: string;
  active: boolean;
}

export interface Designation {
  id: string;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface PracharakHold {
  id: string;
  pracharakId: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  reason: string;
}

export interface Pracharak {
  id: string;
  code: string;
  name: string;
  homeBranchId?: string;
  designationId?: string;
  category: PracharakCategory;
  gender: 'MALE' | 'FEMALE';
  age: number;
  phone: string;
  residenceAddress: string;
  latitude?: number;
  longitude?: number;
  dutyStatus: DutyStatus;
  workingWeekdays: number[]; // days they can perform duties e.g. [0, 3] (Sun, Wed)
  isGyanPracharak: boolean;
  conditionNotes?: string;
  active: boolean;
}

export interface Satsang {
  id: string;
  branchId: string;
  name: string;
  weekday: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // e.g. "05:30 PM - 07:30 PM"
  location: string;
  address: string;
  category: string; // e.g. "Regular Sangat", "Bal Sangat", "Mahila Sangat"
  skipMode: 'NONE' | 'ALTERNATE' | 'FIRST_WEEK_ONLY' | 'LAST_WEEK_ONLY';
  mukhiFillableWeeks: number[]; // e.g. [1, 3]
  active: boolean;
}

export interface SatsangDate {
  id: string;
  branchId: string;
  satsangId: string;
  date: string; // YYYY-MM-DD
  weekday: number;
  weekNumber: number; // 1, 2, 3, 4, 5 of month
  isVisheshDin: boolean;
  visheshDinName?: string;
}

export interface DutyAllocation {
  id: string;
  satsangDateId: string;
  date: string; // YYYY-MM-DD
  branchId: string;
  satsangId: string;
  type: DutyType;
  pracharakId?: string;
  otherZoneDetails?: string;
  localPracharakName?: string;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  attendance: AttendanceStatus;
  actualPerformer?: string; // If pracharak was absent, who performed
  feedback?: string;
  attendanceMarkedBy?: string;
  attendanceMarkedAt?: string;
  overrideReason?: string;
  allocatedBy: string;
  allocatedAt: string;
}

export interface SpecialDay {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  active: boolean;
  description?: string;
}

export interface DutyFreeze {
  id: string;
  year: number;
  month: number; // 1 - 12
  isFrozen: boolean;
  frozenBy: string;
  frozenAt: string;
}

export interface CategoryLimit {
  category: PracharakCategory;
  minDuties: number;
  maxDuties: number;
}

export interface AppSettings {
  mukhiFillableWeeks: number[]; // e.g. [1, 3]
  vicharWeeks: number[]; // e.g. [2]
  requireLocalApproval: boolean;
  requireOtherZoneApproval: boolean;
  categoryLimits: CategoryLimit[];
}

export interface ReportLineConfig {
  text: string;
  size: number;
  color: string;
  align: 'Center' | 'Left' | 'Right';
  bold: boolean;
  italic: boolean;
}

export interface ReportSettings {
  line1: ReportLineConfig;
  line2: ReportLineConfig;
  line3: ReportLineConfig;
  line4: ReportLineConfig;
  contactLine: string;
  showLogo: boolean;
}

export interface AuditLog {
  id: string;
  entityType: 'DUTY' | 'BRANCH' | 'PRACHARAK' | 'FREEZE' | 'SETTINGS' | 'BULK_UPLOAD' | 'USER' | 'SPECIAL_DAY';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'FREEZE' | 'UNFREEZE' | 'AUTO_ALLOCATE';
  actorName: string;
  actorEmail?: string;
  actorRole: UserRole;
  details: string;
  timestamp: string;
}

export interface BulkUploadRow {
  rowNumber: number;
  tab: 'Designations' | 'Sectors' | 'Branches' | 'Pracharaks' | 'Satsangs';
  status: 'NEW' | 'CONFLICT' | 'ERROR';
  data: Record<string, any>;
  existingRecord?: Record<string, any>;
  reason?: string;
  approved?: boolean;
}

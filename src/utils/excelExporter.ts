import * as XLSX from 'xlsx';
import { Branch, Pracharak, DutyAllocation, BulkUploadRow, Language } from '../types';
import { translations, getTranslation } from '../i18n/translations';

/**
 * Downloads a complete multi-tab Master Excel Template for bulk loading.
 */
export function downloadBulkMasterTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Tab 1: Designations
  const designationsData = [
    { Name: 'Senior Pracharak', SortOrder: 1, Active: 'TRUE' },
    { Name: 'Central Pracharak', SortOrder: 2, Active: 'TRUE' },
    { Name: 'Zonal Pracharak', SortOrder: 3, Active: 'TRUE' },
    { Name: 'Gyan Pracharak', SortOrder: 4, Active: 'TRUE' },
    { Name: 'Sewadal Adhikari', SortOrder: 5, Active: 'TRUE' },
  ];
  const wsDes = XLSX.utils.json_to_sheet(designationsData);
  XLSX.utils.book_append_sheet(wb, wsDes, 'Designations');

  // Tab 2: Sectors
  const sectorsData = [
    { Code: 'SEC-01', Name: 'Pune Central Sector', SanyojakName: 'Rev. Kushal Sharma', SanyojakContact: '+91 98220 12345', Active: 'TRUE' },
    { Code: 'SEC-02', Name: 'Pimpri-Chinchwad Sector', SanyojakName: 'Rev. Balwant Singh', SanyojakContact: '+91 98220 54321', Active: 'TRUE' },
    { Code: 'SEC-03', Name: 'Hadapsar & East Sector', SanyojakName: 'Rev. Dilip Patil', SanyojakContact: '+91 98220 67890', Active: 'TRUE' },
    { Code: 'SEC-04', Name: 'Kothrud & West Sector', SanyojakName: 'Rev. Nitin Shinde', SanyojakContact: '+91 98220 99887', Active: 'TRUE' },
  ];
  const wsSec = XLSX.utils.json_to_sheet(sectorsData);
  XLSX.utils.book_append_sheet(wb, wsSec, 'Sectors');

  // Tab 3: Branches
  const branchesData = [
    { Code: 'PN-01', Name: 'Pune Camp Branch', SectorCode: 'SEC-01', SatsangWeekday: 0, RegistrationStatus: 'REGISTERED', ParentBranchCode: '', MukhiName: 'Rev. Ramesh Patil', MukhiContact: '+91 98220 11001', SatsangBhavan: 'Sant Nirankari Satsang Bhavan, Camp', Address: 'Survey No. 42, Camp, Pune', Active: 'TRUE' },
    { Code: 'PN-02', Name: 'Pimpri Branch', SectorCode: 'SEC-02', SatsangWeekday: 0, RegistrationStatus: 'REGISTERED', ParentBranchCode: '', MukhiName: 'Rev. Sunita Shinde', MukhiContact: '+91 98220 22002', SatsangBhavan: 'Sant Nirankari Satsang Bhavan, Pimpri Colony', Address: 'Old Mumbai-Pune Highway, Pimpri', Active: 'TRUE' },
    { Code: 'PN-03', Name: 'Hadapsar Sangat', SectorCode: 'SEC-03', SatsangWeekday: 3, RegistrationStatus: 'UNREGISTERED', ParentBranchCode: 'PN-01', MukhiName: 'Rev. Arvind Kulkarni', MukhiContact: '+91 98220 33003', SatsangBhavan: 'Prabandhakiya Satsang Sthal', Address: 'Solapur Road, Hadapsar', Active: 'TRUE' },
  ];
  const wsBr = XLSX.utils.json_to_sheet(branchesData);
  XLSX.utils.book_append_sheet(wb, wsBr, 'Branches');

  // Tab 4: Pracharaks
  const pracharaksData = [
    { Code: 'PR-101', Name: 'Rev. Harbhajan Singh Ji', HomeBranchCode: 'PN-01', DesignationName: 'Senior Pracharak', Category: 'A+', Gender: 'MALE', Age: 58, Phone: '+91 98221 00101', ResidenceAddress: 'Koregaon Park, Pune', DutyStatus: 'ELIGIBLE', WorkingWeekdays: '0,3', IsGyanPracharak: 'TRUE', ConditionNotes: 'Fluent in Hindi, Punjabi & English' },
    { Code: 'PR-102', Name: 'Rev. Dr. Mohan Lal Ji', HomeBranchCode: 'PN-02', DesignationName: 'Central Pracharak', Category: 'A', Gender: 'MALE', Age: 62, Phone: '+91 98221 00102', ResidenceAddress: 'Pradhikaran, Nigdi', DutyStatus: 'ELIGIBLE', WorkingWeekdays: '0,5', IsGyanPracharak: 'TRUE', ConditionNotes: 'Senior intellectual preacher' },
    { Code: 'PR-103', Name: 'Rev. Shashi Bhushan Ji', HomeBranchCode: 'PN-04', DesignationName: 'Zonal Pracharak', Category: 'A', Gender: 'MALE', Age: 49, Phone: '+91 98221 00103', ResidenceAddress: 'Dahanukar Colony, Kothrud', DutyStatus: 'ELIGIBLE', WorkingWeekdays: '0,3,5', IsGyanPracharak: 'TRUE', ConditionNotes: 'Youth motivator and musical discourse' },
  ];
  const wsPr = XLSX.utils.json_to_sheet(pracharaksData);
  XLSX.utils.book_append_sheet(wb, wsPr, 'Pracharaks');

  // Tab 5: Satsangs
  const satsangsData = [
    { BranchCode: 'PN-01', Name: 'Sunday Morning Regular Sangat', Weekday: 0, Time: '08:30 AM - 11:30 AM', Location: 'Satsang Bhavan Main Hall', Address: 'Camp, Pune', Category: 'Regular Sangat', SkipMode: 'NONE', MukhiFillableWeeks: '1,3' },
    { BranchCode: 'PN-02', Name: 'Sunday Evening Regular Sangat', Weekday: 0, Time: '05:30 PM - 07:30 PM', Location: 'Pimpri Bhavan Hall', Address: 'Pimpri Colony', Category: 'Regular Sangat', SkipMode: 'NONE', MukhiFillableWeeks: '1,3' },
  ];
  const wsSat = XLSX.utils.json_to_sheet(satsangsData);
  XLSX.utils.book_append_sheet(wb, wsSat, 'Satsangs');

  XLSX.writeFile(wb, 'Sant_Nirankari_Zone34_Master_Template.xlsx');
}

/**
 * Exports formatted duty chart to Excel (.xlsx) with localized headers.
 */
export function exportDutyChartExcel(
  duties: DutyAllocation[],
  branches: Branch[],
  pracharaks: Pracharak[],
  monthText: string,
  lang: Language
): void {
  const branchMap = new Map(branches.map(b => [b.id, b]));
  const pracharakMap = new Map(pracharaks.map(p => [p.id, p]));

  const rows = duties.map((d, index) => {
    const branch = branchMap.get(d.branchId);
    const pracharak = d.pracharakId ? pracharakMap.get(d.pracharakId) : undefined;

    let pracharakDisplay = '';
    if (d.type === 'vichar') {
      pracharakDisplay = getTranslation('duty_vichar', lang);
    } else if (d.type === 'local') {
      pracharakDisplay = `${getTranslation('duty_local', lang)}: ${d.localPracharakName || ''}`;
    } else if (d.type === 'other_zone') {
      pracharakDisplay = `${getTranslation('duty_other_zone', lang)}: ${d.otherZoneDetails || ''}`;
    } else if (d.type === 'no_satsang') {
      pracharakDisplay = getTranslation('duty_no_satsang', lang);
    } else if (pracharak) {
      pracharakDisplay = `${pracharak.name} (${pracharak.code}) [Cat ${pracharak.category}]`;
    } else {
      pracharakDisplay = getTranslation('duty_unfilled', lang);
    }

    return {
      [getTranslation('serialNo', lang)]: index + 1,
      [getTranslation('month', lang)]: d.date,
      [getTranslation('branchName', lang)]: branch ? `${branch.name} (${branch.code})` : d.branchId,
      [getTranslation('selectDutyType', lang)]: d.type,
      [getTranslation('pracharakName', lang)]: pracharakDisplay,
      [getTranslation('status', lang)]: d.approvalStatus,
      [getTranslation('markAttendance', lang)]: d.attendance,
      [getTranslation('whoPerformedInstead', lang)]: d.actualPerformer || '-',
      [getTranslation('feedbackNotes', lang)]: d.feedback || '',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 38 },
    { wch: 14 },
    { wch: 12 },
    { wch: 22 },
    { wch: 35 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Duty Chart');
  XLSX.writeFile(wb, `Duty_Chart_Zone34_${monthText.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Exports duty chart directly to CSV (.csv)
 */
export function exportDutyChartCsv(
  duties: DutyAllocation[],
  branches: Branch[],
  pracharaks: Pracharak[],
  monthText: string,
  lang: Language
): void {
  const branchMap = new Map(branches.map(b => [b.id, b]));
  const pracharakMap = new Map(pracharaks.map(p => [p.id, p]));

  const rows = duties.map((d, index) => {
    const branch = branchMap.get(d.branchId);
    const pracharak = d.pracharakId ? pracharakMap.get(d.pracharakId) : undefined;

    let pracharakDisplay = '';
    if (d.type === 'vichar') {
      pracharakDisplay = getTranslation('duty_vichar', lang);
    } else if (d.type === 'local') {
      pracharakDisplay = `${getTranslation('duty_local', lang)}: ${d.localPracharakName || ''}`;
    } else if (d.type === 'other_zone') {
      pracharakDisplay = `${getTranslation('duty_other_zone', lang)}: ${d.otherZoneDetails || ''}`;
    } else if (d.type === 'no_satsang') {
      pracharakDisplay = getTranslation('duty_no_satsang', lang);
    } else if (pracharak) {
      pracharakDisplay = `${pracharak.name} (${pracharak.code}) [Cat ${pracharak.category}]`;
    } else {
      pracharakDisplay = getTranslation('duty_unfilled', lang);
    }

    return {
      [getTranslation('serialNo', lang)]: index + 1,
      [getTranslation('month', lang)]: d.date,
      [getTranslation('branchName', lang)]: branch ? `${branch.name} (${branch.code})` : d.branchId,
      [getTranslation('selectDutyType', lang)]: d.type,
      [getTranslation('pracharakName', lang)]: pracharakDisplay,
      [getTranslation('status', lang)]: d.approvalStatus,
      [getTranslation('markAttendance', lang)]: d.attendance,
      [getTranslation('whoPerformedInstead', lang)]: d.actualPerformer || '-',
      [getTranslation('feedbackNotes', lang)]: d.feedback || '',
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Duty Chart');
  XLSX.writeFile(wb, `Duty_Chart_Zone34_${monthText.replace(/\s+/g, '_')}.csv`, { bookType: 'csv' });
}

/**
 * Parses uploaded .xlsx file into classified BulkUploadRow items (NEW, CONFLICT, ERROR).
 */
export async function parseBulkExcelFile(
  file: File,
  existingData: {
    sectors: any[];
    branches: any[];
    pracharaks: any[];
    designations: any[];
    satsangs: any[];
  }
): Promise<BulkUploadRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const classifiedRows: BulkUploadRow[] = [];

  let rowCounter = 1;

  // 1. Process Designations
  if (workbook.SheetNames.includes('Designations')) {
    const sheet = workbook.Sheets['Designations'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    rows.forEach((r) => {
      const existing = existingData.designations.find(
        (d) => d.name.toLowerCase() === String(r.Name || '').toLowerCase()
      );
      if (!r.Name) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Designations',
          status: 'ERROR',
          data: r,
          reason: 'Designation Name is required',
        });
      } else if (existing) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Designations',
          status: 'CONFLICT',
          data: r,
          existingRecord: existing,
          reason: `Designation '${r.Name}' already exists. Click approve to update.`,
          approved: false,
        });
      } else {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Designations',
          status: 'NEW',
          data: r,
          approved: true,
        });
      }
    });
  }

  // 2. Process Sectors
  if (workbook.SheetNames.includes('Sectors')) {
    const sheet = workbook.Sheets['Sectors'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    rows.forEach((r) => {
      const existing = existingData.sectors.find(
        (s) => s.code.toUpperCase() === String(r.Code || '').toUpperCase()
      );
      if (!r.Code || !r.Name) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Sectors',
          status: 'ERROR',
          data: r,
          reason: 'Sector Code and Name are required',
        });
      } else if (existing) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Sectors',
          status: 'CONFLICT',
          data: r,
          existingRecord: existing,
          reason: `Sector code '${r.Code}' matches '${existing.name}'. Approval needed to overwrite.`,
          approved: false,
        });
      } else {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Sectors',
          status: 'NEW',
          data: r,
          approved: true,
        });
      }
    });
  }

  // 3. Process Branches
  if (workbook.SheetNames.includes('Branches')) {
    const sheet = workbook.Sheets['Branches'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    rows.forEach((r) => {
      const existing = existingData.branches.find(
        (b) => b.code.toUpperCase() === String(r.Code || '').toUpperCase()
      );
      if (!r.Code || !r.Name) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Branches',
          status: 'ERROR',
          data: r,
          reason: 'Branch Code and Name are required',
        });
      } else if (existing) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Branches',
          status: 'CONFLICT',
          data: r,
          existingRecord: existing,
          reason: `Branch '${r.Code}' matches '${existing.name}'. Approval needed to update.`,
          approved: false,
        });
      } else {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Branches',
          status: 'NEW',
          data: r,
          approved: true,
        });
      }
    });
  }

  // 4. Process Pracharaks
  if (workbook.SheetNames.includes('Pracharaks')) {
    const sheet = workbook.Sheets['Pracharaks'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    rows.forEach((r) => {
      const existing = existingData.pracharaks.find(
        (p) => p.code.toUpperCase() === String(r.Code || '').toUpperCase()
      );
      if (!r.Code || !r.Name) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Pracharaks',
          status: 'ERROR',
          data: r,
          reason: 'Pracharak Code and Name are required',
        });
      } else if (existing) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Pracharaks',
          status: 'CONFLICT',
          data: r,
          existingRecord: existing,
          reason: `Pracharak code '${r.Code}' matches '${existing.name}'. Approval needed to update.`,
          approved: false,
        });
      } else {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Pracharaks',
          status: 'NEW',
          data: r,
          approved: true,
        });
      }
    });
  }

  // 5. Process Satsangs
  if (workbook.SheetNames.includes('Satsangs')) {
    const sheet = workbook.Sheets['Satsangs'];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);
    rows.forEach((r) => {
      const existing = existingData.satsangs.find(
        (s) =>
          s.name.toLowerCase() === String(r.Name || '').toLowerCase() &&
          s.weekday === Number(r.Weekday ?? 0)
      );
      if (!r.Name || r.Weekday === undefined) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Satsangs',
          status: 'ERROR',
          data: r,
          reason: 'Satsang Name and Weekday are required',
        });
      } else if (existing) {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Satsangs',
          status: 'CONFLICT',
          data: r,
          existingRecord: existing,
          reason: `Satsang '${r.Name}' already exists on weekday ${r.Weekday}.`,
          approved: false,
        });
      } else {
        classifiedRows.push({
          rowNumber: rowCounter++,
          tab: 'Satsangs',
          status: 'NEW',
          data: r,
          approved: true,
        });
      }
    });
  }

  return classifiedRows;
}

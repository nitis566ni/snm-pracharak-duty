import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  Globe,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Building,
  User,
  Clock,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DutyAllocation, Branch, Pracharak, Language } from '../../types';
import { exportDutyCalendarToPdf } from '../../utils/pdfDutyChartExporter';
import { getTranslation } from '../../i18n/translations';

interface PdfDutyChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonthName?: string;
}

export const PdfDutyChartModal: React.FC<PdfDutyChartModalProps> = ({
  isOpen,
  onClose,
  defaultMonthName,
}) => {
  const {
    selectedYear,
    selectedMonth,
    branches,
    sectors,
    pracharaks,
    dutyAllocations,
    specialDays,
    appSettings,
    lang: currentAppLang,
  } = useApp();

  // Local state for PDF customization
  const [pdfLang, setPdfLang] = useState<Language>(currentAppLang || 'en');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [includeContacts, setIncludeContacts] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Month date range
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Month title translations
  const monthNamesDevanagari: Record<number, { hi: string; mr: string; en: string }> = {
    1: { en: 'January', hi: 'जनवरी', mr: 'जानेवारी' },
    2: { en: 'February', hi: 'फ़रवरी', mr: 'फेब्रुवारी' },
    3: { en: 'March', hi: 'मार्च', mr: 'मार्च' },
    4: { en: 'April', hi: 'अप्रैल', mr: 'एप्रिल' },
    5: { en: 'May', hi: 'मई', mr: 'मे' },
    6: { en: 'June', hi: 'जून', mr: 'जून' },
    7: { en: 'July', hi: 'जुलाई', mr: 'जुलै' },
    8: { en: 'August', hi: 'अगस्त', mr: 'ऑगस्ट' },
    9: { en: 'September', hi: 'सितंबर', mr: 'सप्टेंबर' },
    10: { en: 'October', hi: 'अक्टूबर', mr: 'ऑक्टोबर' },
    11: { en: 'November', hi: 'नवंबर', mr: 'नोव्हेंबर' },
    12: { en: 'December', hi: 'दिसंबर', mr: 'डिसेंबर' },
  };

  const monthLocalized = monthNamesDevanagari[selectedMonth]?.[pdfLang] || monthNamesDevanagari[selectedMonth]?.en || 'Current Month';

  // Weekday translations
  const weekdayNames: Record<number, { en: string; hi: string; mr: string }> = {
    0: { en: 'Sunday', hi: 'रविवार', mr: 'रविवार' },
    1: { en: 'Monday', hi: 'सोमवार', mr: 'सोमवार' },
    2: { en: 'Tuesday', hi: 'मंगलवार', mr: 'मंगळवार' },
    3: { en: 'Wednesday', hi: 'बुधवार', mr: 'बुधवार' },
    4: { en: 'Thursday', hi: 'गुरुवार', mr: 'गुरुवार' },
    5: { en: 'Friday', hi: 'शुक्रवार', mr: 'शुक्रवार' },
    6: { en: 'Saturday', hi: 'शनिवार', mr: 'शनिवार' },
  };

  // Filter branches and duties
  const filteredBranches = useMemo(() => {
    if (selectedSectorFilter === 'all') return branches;
    return branches.filter((b) => b.sectorId === selectedSectorFilter);
  }, [branches, selectedSectorFilter]);

  const activeBranchIds = useMemo(() => new Set(filteredBranches.map((b) => b.id)), [filteredBranches]);

  const monthDuties = useMemo(() => {
    return dutyAllocations
      .filter((d) => {
        return d.date >= monthStart && d.date <= monthEnd && activeBranchIds.has(d.branchId);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dutyAllocations, monthStart, monthEnd, activeBranchIds]);

  const branchMap = useMemo(() => new Map(branches.map((b) => [b.id, b])), [branches]);
  const pracharakMap = useMemo(() => new Map(pracharaks.map((p) => [p.id, p])), [pracharaks]);
  const sectorMap = useMemo(() => new Map(sectors.map((s) => [s.id, s])), [sectors]);

  // Headers localized
  const labels = useMemo(() => {
    if (pdfLang === 'hi') {
      return {
        motto: 'धन निरंकार जी',
        missionName: 'संत निरंकारी मण्डल (पंजीकृत) · मुख्यालय दिल्ली',
        zoneHeader: `ज़ोन ३४, पुणे परिक्षेत्र (महाराष्ट्र)`,
        chartTitle: `मासिक सत्संग प्रचारक ड्यूटी रोस्टर — ${monthLocalized} ${selectedYear}`,
        sNo: 'क्र.',
        dateDay: 'दिनांक व वार',
        time: 'समय',
        bhavan: 'सत्संग भवन / शाखा',
        sector: 'सेक्टर',
        preacher: 'नियुक्त प्रचारक महात्मा / सेवा',
        category: 'श्रेणी / कोड',
        phone: 'संपर्क क्र.',
        type: 'ड्यूटी प्रकार',
        status: 'मंजूरी',
        signZonal: 'ज़ोनल प्रभारी / संयोजक',
        signCoord: 'ज़ोन प्रचारक समन्वयक',
        signMukhi: 'शाखा मुखी / व्यवस्थापक',
        notice: 'नोट: सभी प्रचारक महात्मा समय से १५ मिनट पूर्व भवन में उपस्थित होने की कृपा करें। सत्संग विचार केवल मिशन के सिद्धांतों पर आधारित हों।',
        downloading: 'पीडीएफ चार्ट तैयार हो रहा है...',
        successMsg: 'पीडीएफ सफलतापूर्वक डाउनलोड हो गया!',
      };
    } else if (pdfLang === 'mr') {
      return {
        motto: 'धन निरंकार जी',
        missionName: 'संत निरंकारी मंडळ (नोंदणीकृत) · मुख्यालय दिल्ली',
        zoneHeader: `झोन ३४, पुणे विभाग (महाराष्ट्र)`,
        chartTitle: `मासिक सत्संग प्रचारक सेवा विवरण — ${monthLocalized} ${selectedYear}`,
        sNo: 'अ.क्र.',
        dateDay: 'दिनांक व वार',
        time: 'वेळ',
        bhavan: 'सत्संग भवन / शाखा',
        sector: 'सेक्टर',
        preacher: 'नियुक्त प्रचारक महात्मा / सेवा',
        category: 'श्रेणी / कोड',
        phone: 'संपर्क क्र.',
        type: 'ड्यूटी प्रकार',
        status: 'स्थिती',
        signZonal: 'झोनल प्रभारी / संयोजक',
        signCoord: 'झोन प्रचारक समन्वयक',
        signMukhi: 'शाखा मुखी / व्यवस्थापक',
        notice: 'टीप: सर्व प्रचारक महात्मांनी वेळेपूर्वी १५ मिनिटे आधी सत्संग भवनात उपस्थित राहावे. विचार केवळ मिशनच्या सिद्धांतांवर आधारित असावेत.',
        downloading: 'पीडीएफ चार्ट तयार होत आहे...',
        successMsg: 'पीडीएफ यशस्वीरीत्या डाउनलोड झाले!',
      };
    }

    return {
      motto: 'Dhan Nirankar Ji',
      missionName: 'Sant Nirankari Mandal (Regd.) · Head Office Delhi',
      zoneHeader: `Zone 34, Pune Metropolitan Region (Maharashtra)`,
      chartTitle: `Official Monthly Pracharak Duty Roster — ${monthLocalized} ${selectedYear}`,
      sNo: 'S.No',
      dateDay: 'Date & Day',
      time: 'Time',
      bhavan: 'Satsang Bhavan / Branch',
      sector: 'Sector',
      preacher: 'Assigned Preacher / Discourse',
      category: 'Category / Code',
      phone: 'Contact No.',
      type: 'Duty Type',
      status: 'Status',
      signZonal: 'Zonal Incharge / Sanyojak',
      signCoord: 'Zonal Pracharak Coordinator',
      signMukhi: 'Branch Mukhi / Bhavana Head',
      notice: 'Note: All Pracharaks are requested to arrive 15 minutes before the congregation begins. Discourses must adhere to Sant Nirankari Mission principles.',
      downloading: 'Generating PDF Duty Chart...',
      successMsg: 'PDF Duty Chart exported successfully!',
    };
  }, [pdfLang, monthLocalized, selectedYear]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportMessage(labels.downloading);
    try {
      const filename = `Sant_Nirankari_Zone34_Duty_Roster_${monthLocalized}_${selectedYear}_${pdfLang.toUpperCase()}.pdf`;
      const res = await exportDutyCalendarToPdf('pdf-printable-chart-content', filename);
      if (res.success) {
        setExportMessage(labels.successMsg);
        setTimeout(() => setExportMessage(null), 3000);
      } else {
        setExportMessage(res.error || 'Export failed');
      }
    } catch (err: any) {
      setExportMessage('Export failed: ' + err?.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col border border-[#E2EFEB] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EFEB] bg-[#F9FCFB] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F4C42] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-[#D4F58C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0A3A33]">
                  Export Official Duty Chart (PDF)
                </h3>
                <span className="text-[11px] font-bold bg-[#E3F8AC] text-[#0A3A33] px-2 py-0.5 rounded-full">
                  Devanagari Font Supported
                </span>
              </div>
              <p className="text-xs text-[#4A726B]">
                High-fidelity printable format with Hindi & Marathi script rendering for official Mandal distribution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200/80 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar: Language Switcher & Filters */}
        <div className="px-5 py-3 border-b border-[#E2EFEB] bg-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0A3A33] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#2B8274]" />
              <span>Language / भाषा:</span>
            </span>
            <div className="flex items-center bg-[#F0F7F5] p-0.5 rounded-xl border border-[#D5E8E3]">
              <button
                onClick={() => setPdfLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  pdfLang === 'en'
                    ? 'bg-white text-[#0A3A33] shadow-xs'
                    : 'text-[#719B93] hover:text-[#0A3A33]'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setPdfLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  pdfLang === 'hi'
                    ? 'bg-white text-[#0A3A33] shadow-xs'
                    : 'text-[#719B93] hover:text-[#0A3A33]'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setPdfLang('mr')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  pdfLang === 'mr'
                    ? 'bg-white text-[#0A3A33] shadow-xs'
                    : 'text-[#719B93] hover:text-[#0A3A33]'
                }`}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>

          {/* Sector Filter & Checkboxes */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#4A726B] font-medium">Sector:</span>
              <select
                value={selectedSectorFilter}
                onChange={(e) => setSelectedSectorFilter(e.target.value)}
                className="bg-[#F0F7F5] border border-[#D5E8E3] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0A3A33] focus:outline-none"
              >
                <option value="all">All Sectors ({branches.length} Bhavans)</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-[#0A3A33] cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded border-[#D5E8E3] text-[#0F4C42] focus:ring-0"
              />
              <span>Signatures Block</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-[#0A3A33] cursor-pointer">
              <input
                type="checkbox"
                checked={includeContacts}
                onChange={(e) => setIncludeContacts(e.target.checked)}
                className="rounded border-[#D5E8E3] text-[#0F4C42] focus:ring-0"
              />
              <span>Show Preacher Contact</span>
            </label>
          </div>
        </div>

        {/* Live Document Preview Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          {/* Printable Sheet (Standard A4 Landscape proportions) */}
          <div
            id="pdf-printable-chart-content"
            className="bg-white w-full max-w-[1100px] p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 text-[#0F3B38] font-devanagari select-text"
            style={{ fontFamily: "'Noto Sans Devanagari', 'Plus Jakarta Sans', sans-serif" }}
          >
            {/* Header Letterhead */}
            <div className="text-center border-b-2 border-[#0F4C42] pb-4 mb-4">
              <div className="inline-block bg-[#E8F6F2] text-[#0F4C42] px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-1">
                {labels.motto}
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A3A33] tracking-tight uppercase">
                {labels.missionName}
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-[#2B8274] mt-0.5">
                {labels.zoneHeader}
              </h2>
              <div className="mt-2 inline-block bg-[#0F4C42] text-white px-5 py-1.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs">
                {labels.chartTitle}
              </div>
              <p className="text-[11px] text-[#719B93] mt-1.5">
                Total Duties Scheduled: <strong>{monthDuties.length}</strong> | Generated on: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Official Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-[#0F4C42] text-white text-[11px] font-bold">
                    <th className="p-2 border border-slate-400 text-center w-8">{labels.sNo}</th>
                    <th className="p-2 border border-slate-400 min-w-[110px]">{labels.dateDay}</th>
                    <th className="p-2 border border-slate-400 w-24">{labels.time}</th>
                    <th className="p-2 border border-slate-400 min-w-[160px]">{labels.bhavan}</th>
                    <th className="p-2 border border-slate-400 w-24">{labels.sector}</th>
                    <th className="p-2 border border-slate-400 min-w-[180px]">{labels.preacher}</th>
                    <th className="p-2 border border-slate-400 text-center w-16">{labels.category}</th>
                    {includeContacts && (
                      <th className="p-2 border border-slate-400 min-w-[100px]">{labels.phone}</th>
                    )}
                    <th className="p-2 border border-slate-400 text-center w-20">{labels.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {monthDuties.length === 0 ? (
                    <tr>
                      <td colSpan={includeContacts ? 9 : 8} className="p-8 text-center text-slate-500 italic">
                        No duties allocated for this selection.
                      </td>
                    </tr>
                  ) : (
                    monthDuties.map((d, index) => {
                      const branch = branchMap.get(d.branchId);
                      const pr = d.pracharakId ? pracharakMap.get(d.pracharakId) : undefined;
                      const sector = branch ? sectorMap.get(branch.sectorId) : undefined;

                      const dateObj = new Date(d.date);
                      const dayOfWeek = dateObj.getDay();
                      const weekdayText = weekdayNames[dayOfWeek]?.[pdfLang] || weekdayNames[dayOfWeek]?.en || '';

                      // Preacher text
                      let preacherText = '';
                      let preacherCategory = pr?.category || '-';
                      let preacherPhone = pr?.phone || '-';

                      if (d.type === 'vichar') {
                        preacherText = pdfLang === 'hi'
                          ? 'सद्गुरु माता सुदीक्षा जी महाराज विचार (वीडियो प्रसारण)'
                          : pdfLang === 'mr'
                          ? 'सद्गुरु माता सुदीक्षा जी महाराज विचार (व्हिडिओ प्रसारण)'
                          : 'Satguru Mata Sudiksha Ji Maharaj Vichar (Video Broadcast)';
                        preacherCategory = 'Vichar';
                        preacherPhone = 'Audio-Visual';
                      } else if (d.type === 'local') {
                        preacherText = d.localPracharakName
                          ? `${d.localPracharakName} (${pdfLang === 'hi' ? 'स्थानीय प्रचारक' : pdfLang === 'mr' ? 'स्थानिक प्रचारक' : 'Local Preacher'})`
                          : 'Local Preacher';
                      } else if (d.type === 'other_zone') {
                        preacherText = d.otherZoneDetails
                          ? `${d.otherZoneDetails} (${pdfLang === 'hi' ? 'अन्य ज़ोन' : pdfLang === 'mr' ? 'इतर झोन' : 'Other Zone'})`
                          : 'Other Zone';
                      } else if (pr) {
                        preacherText = pr.name;
                      } else {
                        preacherText = pdfLang === 'hi' ? 'रिक्त / अनिर्धारित' : pdfLang === 'mr' ? 'रिक्त / अनियुक्त' : 'Unallocated';
                      }

                      return (
                        <tr
                          key={d.id}
                          className={`border-b border-slate-300 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#FAFDFB]'
                          } hover:bg-emerald-50/40`}
                        >
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-700">
                            {index + 1}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono text-[11px]">
                            <strong className="text-[#0A3A33] block">{d.date}</strong>
                            <span className="text-[10px] text-[#719B93]">{weekdayText}</span>
                          </td>
                          <td className="p-2 border border-slate-300 font-mono text-[10px]">
                            {branch ? (
                              <span>08:30 - 11:30 AM</span>
                            ) : (
                              'Morning'
                            )}
                          </td>
                          <td className="p-2 border border-slate-300">
                            <strong className="text-[#0A3A33] block">
                              {branch?.name || d.branchId}
                            </strong>
                            <span className="text-[10px] text-[#719B93] block truncate">
                              {branch?.satsangBhavan || branch?.code}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-[10px] font-medium text-slate-600">
                            {sector?.name || 'Zone 34'}
                          </td>
                          <td className="p-2 border border-slate-300">
                            <span className={`font-bold ${
                              d.type === 'vichar'
                                ? 'text-[#0F4C42]'
                                : d.type === 'local'
                                ? 'text-amber-800'
                                : 'text-[#0A3A33]'
                            }`}>
                              {preacherText}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold font-mono text-[10px]">
                              {preacherCategory}
                            </span>
                          </td>
                          {includeContacts && (
                            <td className="p-2 border border-slate-300 font-mono text-[10px] text-slate-700">
                              {preacherPhone}
                            </td>
                          )}
                          <td className="p-2 border border-slate-300 text-center">
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                              d.approvalStatus === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {d.approvalStatus === 'APPROVED' ? '✓ OK' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Verification Note */}
            <div className="mt-4 p-2.5 bg-[#F9FCFB] rounded-xl border border-slate-200 text-[11px] text-[#4A726B] leading-relaxed">
              {labels.notice}
            </div>

            {/* Official Signatures Block */}
            {includeSignatures && (
              <div className="mt-8 pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs font-bold text-[#0A3A33]">
                <div className="space-y-6">
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <p>{labels.signZonal}</p>
                  <p className="text-[10px] text-[#719B93] font-normal">Sant Nirankari Mandal, Zone 34</p>
                </div>
                <div className="space-y-6">
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <p>{labels.signCoord}</p>
                  <p className="text-[10px] text-[#719B93] font-normal">Zone 34 Pracharak Wing</p>
                </div>
                <div className="space-y-6">
                  <div className="h-10 border-b border-dashed border-slate-400" />
                  <p>{labels.signMukhi}</p>
                  <p className="text-[10px] text-[#719B93] font-normal">Respective Bhavan Sanyojak</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E2EFEB] bg-[#F9FCFB] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#4A726B]">
            {exportMessage ? (
              <span className="font-bold text-[#0F4C42] flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-4 h-4 text-[#2B8274]" />
                <span>{exportMessage}</span>
              </span>
            ) : (
              <span>
                Exporting: <strong>{monthDuties.length}</strong> congregation duties in{' '}
                <strong>{pdfLang === 'hi' ? 'Hindi (हिंदी)' : pdfLang === 'mr' ? 'Marathi (मराठी)' : 'English'}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-[#0A3A33] border border-[#D5E8E3] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#2B8274]" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-5 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#D4F58C]" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF Chart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

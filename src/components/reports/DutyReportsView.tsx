import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building,
  User,
  Globe,
  Download,
  Layers,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportDutyChartExcel, exportDutyChartCsv } from '../../utils/excelExporter';
import { PdfDutyChartModal } from '../scheduling/PdfDutyChartModal';
import { Language } from '../../types';

export const DutyReportsView: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    branches,
    sectors,
    pracharaks,
    dutyAllocations,
    reportSettings,
    t,
    lang,
    setLang,
  } = useApp();

  const [reportLevel, setReportLevel] = useState<'Zone' | 'Sector' | 'Branch'>('Zone');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>(
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
  );
  const [toDate, setToDate] = useState<string>(
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate()}`
  );
  const [reportType, setReportType] = useState<'pracharak_wise' | 'branch_wise'>('pracharak_wise');

  // Filter duties by date range and level
  const filteredDuties = dutyAllocations.filter((d) => {
    if (d.date < fromDate || d.date > toDate) return false;
    if (reportLevel === 'Branch' && selectedEntityId !== 'all') {
      return d.branchId === selectedEntityId;
    }
    if (reportLevel === 'Sector' && selectedEntityId !== 'all') {
      const branch = branches.find((b) => b.id === d.branchId);
      return branch?.sectorId === selectedEntityId;
    }
    return true;
  });

  const monthName = `${fromDate} to ${toDate}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    exportDutyChartExcel(filteredDuties, branches, pracharaks, monthName, lang);
  };

  const handleCsvExport = () => {
    exportDutyChartCsv(filteredDuties, branches, pracharaks, monthName, lang);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Action Header from Screenshot 12 (Hidden in Print) */}
      <div className="no-print bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0A3A33] tracking-tight">
            Reports
          </h2>
          <p className="text-xs text-[#719B93] mt-0.5">
            Download the Satsang duty schedule as Excel or CSV, filtered by level and date range.
          </p>
        </div>

        {/* Filter Controls (Screenshot 12) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Report Level */}
          <div>
            <label className="block font-bold text-[#0A3A33] mb-1.5">
              Report level
            </label>
            <select
              value={reportLevel}
              onChange={(e) => {
                setReportLevel(e.target.value as any);
                setSelectedEntityId('all');
              }}
              className="w-full p-2.5 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs font-semibold text-[#0A3A33] focus:outline-none"
            >
              <option value="Zone">Zone</option>
              <option value="Sector">Sector</option>
              <option value="Branch">Branch</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block font-bold text-[#0A3A33] mb-1.5">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full p-2.5 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs font-mono focus:outline-none"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block font-bold text-[#0A3A33] mb-1.5">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full p-2.5 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Optional secondary entity selector if Sector or Branch selected */}
        {reportLevel === 'Sector' && (
          <div className="pt-2 text-xs">
            <label className="block font-bold text-[#0A3A33] mb-1">Select Sector:</label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full sm:w-80 p-2 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs"
            >
              <option value="all">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {reportLevel === 'Branch' && (
          <div className="pt-2 text-xs">
            <label className="block font-bold text-[#0A3A33] mb-1">Select Branch:</label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="w-full sm:w-80 p-2 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl text-xs"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons (Direct reproduction of screenshot 12) */}
        <div className="pt-3 border-t border-[#E2EFEB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExcelExport}
              className="px-5 py-2.5 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>Download Excel</span>
            </button>
            <button
              onClick={handleCsvExport}
              className="px-5 py-2.5 bg-white hover:bg-[#F0F7F5] text-[#0A3A33] text-xs font-bold rounded-xl border border-[#D5E8E3] flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <span>Download CSV</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* View layout toggle */}
            <div className="flex items-center gap-1 bg-[#F0F7F5] p-1 rounded-xl border border-[#D5E8E3]">
              <button
                onClick={() => setReportType('pracharak_wise')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  reportType === 'pracharak_wise' ? 'bg-[#0F4C42] text-white' : 'text-[#4A726B]'
                }`}
              >
                Pracharak-wise
              </button>
              <button
                onClick={() => setReportType('branch_wise')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  reportType === 'branch_wise' ? 'bg-[#0F4C42] text-white' : 'text-[#4A726B]'
                }`}
              >
                Branch-wise
              </button>
            </div>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#145d51] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>Export PDF Chart</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#E3F8AC] hover:bg-[#d8f58c] text-[#0A3A33] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-[#0F4C42]" />
              <span>Print Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Formatted Duty Chart Card with custom Report Header styles */}
      <div className="bg-white rounded-3xl p-8 border border-[#E2EFEB] shadow-xs print-container font-devanagari">
        {/* Header Lines Rendered According to ReportSettings from Screenshot 14 */}
        <div className="text-center pb-6 border-b-2 border-[#0F4C42] mb-6">
          {reportSettings.showLogo && (
            <div className="w-14 h-14 rounded-full bg-[#EBF7F4] border-2 border-[#0F4C42] mx-auto flex items-center justify-center text-[#0F4C42] mb-3">
              <svg className="w-8 h-8 text-[#0F4C42]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          )}

          {/* Line 1 */}
          {reportSettings.line1.text && (
            <h1
              style={{
                fontSize: `${reportSettings.line1.size}px`,
                color: reportSettings.line1.color,
                fontWeight: reportSettings.line1.bold ? 'bold' : 'normal',
                fontStyle: reportSettings.line1.italic ? 'italic' : 'normal',
                textAlign: reportSettings.line1.align.toLowerCase() as any,
              }}
            >
              {reportSettings.line1.text}
            </h1>
          )}

          {/* Line 2 */}
          {reportSettings.line2.text && (
            <h2
              style={{
                fontSize: `${reportSettings.line2.size}px`,
                color: reportSettings.line2.color,
                fontWeight: reportSettings.line2.bold ? 'bold' : 'normal',
                fontStyle: reportSettings.line2.italic ? 'italic' : 'normal',
                textAlign: reportSettings.line2.align.toLowerCase() as any,
              }}
              className="mt-0.5"
            >
              {reportSettings.line2.text}
            </h2>
          )}

          {/* Line 3 */}
          {reportSettings.line3.text && (
            <h3
              style={{
                fontSize: `${reportSettings.line3.size}px`,
                color: reportSettings.line3.color,
                fontWeight: reportSettings.line3.bold ? 'bold' : 'normal',
                fontStyle: reportSettings.line3.italic ? 'italic' : 'normal',
                textAlign: reportSettings.line3.align.toLowerCase() as any,
              }}
              className="mt-0.5"
            >
              {reportSettings.line3.text} ({fromDate} to {toDate})
            </h3>
          )}

          {/* Line 4 */}
          {reportSettings.line4.text && (
            <p
              style={{
                fontSize: `${reportSettings.line4.size}px`,
                color: reportSettings.line4.color,
                fontWeight: reportSettings.line4.bold ? 'bold' : 'normal',
                fontStyle: reportSettings.line4.italic ? 'italic' : 'normal',
                textAlign: reportSettings.line4.align.toLowerCase() as any,
              }}
              className="mt-0.5"
            >
              {reportSettings.line4.text}
            </p>
          )}

          {/* Contact Line */}
          {reportSettings.contactLine && (
            <p className="text-[11px] text-[#719B93] mt-2 font-mono">
              {reportSettings.contactLine}
            </p>
          )}
        </div>

        {/* Table content: Pracharak-Wise or Branch-Wise */}
        {reportType === 'pracharak_wise' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F0F7F5] border-y border-[#D5E8E3] text-[#0A3A33] font-bold">
                  <th className="py-2.5 px-3 w-12 border-r border-[#D5E8E3] text-center">S.No</th>
                  <th className="py-2.5 px-3 w-48 border-r border-[#D5E8E3]">Pracharak Name & Phone</th>
                  <th className="py-2.5 px-3 w-16 border-r border-[#D5E8E3] text-center">Cat</th>
                  <th className="py-2.5 px-3 border-r border-[#D5E8E3]">
                    Allocated Satsang Duties in Range ({filteredDuties.length} total)
                  </th>
                  <th className="py-2.5 px-3 w-20 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EFEB]">
                {pracharaks.map((p, index) => {
                  const pDuties = filteredDuties.filter((d) => d.pracharakId === p.id);

                  return (
                    <tr key={p.id} className="hover:bg-[#F9FCFB]">
                      <td className="py-2.5 px-3 border-r border-[#E2EFEB] text-center font-mono text-[#719B93]">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#E2EFEB]">
                        <div className="font-bold text-[#0A3A33]">{p.name}</div>
                        <div className="text-[10px] text-[#719B93] font-mono">
                          {p.phone} · {p.code}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#E2EFEB] text-center font-mono font-bold text-[#0F4C42]">
                        {p.category}
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#E2EFEB]">
                        {pDuties.length === 0 ? (
                          <span className="text-[#9BB6B0] italic text-[11px]">
                            No duties scheduled in this date range
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {pDuties.map((d) => {
                              const br = branches.find((b) => b.id === d.branchId);
                              return (
                                <span
                                  key={d.id}
                                  className="bg-[#EBF7F4] border border-[#CDEAE2] text-[#0A3A33] px-2 py-0.5 rounded-md text-[11px] font-medium"
                                >
                                  <strong>{d.date}:</strong> {br?.name} ({br?.code})
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0A3A33]">
                        {pDuties.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-6">
            {branches.map((branch) => {
              const brDuties = filteredDuties.filter((d) => d.branchId === branch.id);

              return (
                <div key={branch.id} className="border border-[#D5E8E3] rounded-2xl overflow-hidden">
                  <div className="bg-[#F0F7F5] px-4 py-2 border-b border-[#D5E8E3] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#0A3A33]">
                        {branch.name} ({branch.code})
                      </h4>
                      <p className="text-[11px] text-[#719B93]">
                        {branch.satsangBhavan} · Mukhi: {branch.mukhiName} ({branch.mukhiContact})
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0F4C42] bg-[#E3F8AC] px-2 py-0.5 rounded-md">
                      {brDuties.length} Duties
                    </span>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAFDFB] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                        <th className="py-1.5 px-3 w-28">Date</th>
                        <th className="py-1.5 px-3">Duty Assignment</th>
                        <th className="py-1.5 px-3 w-32">Status</th>
                        <th className="py-1.5 px-3 w-32">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2EFEB]">
                      {brDuties.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-2 px-3 text-center text-[#9BB6B0] italic">
                            No scheduled duties in date range.
                          </td>
                        </tr>
                      ) : (
                        brDuties.map((d) => {
                          const pr = pracharaks.find((p) => p.id === d.pracharakId);
                          return (
                            <tr key={d.id} className="hover:bg-[#F9FCFB]">
                              <td className="py-1.5 px-3 font-mono font-bold text-[#0A3A33]">
                                {d.date}
                              </td>
                              <td className="py-1.5 px-3">
                                {d.type === 'vichar' ? (
                                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    Satguru Mata Ji Vichar
                                  </span>
                                ) : pr ? (
                                  <span className="font-bold text-[#0A3A33]">
                                    {pr.name} ({pr.code})
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">Unassigned</span>
                                )}
                              </td>
                              <td className="py-1.5 px-3">
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {d.approvalStatus}
                                </span>
                              </td>
                              <td className="py-1.5 px-3">
                                <span className="font-medium text-[#4A726B]">
                                  {d.attendance === 'PRESENT'
                                    ? 'Present'
                                    : d.attendance === 'ABSENT'
                                    ? `Absent (${d.actualPerformer || 'No Sub'})`
                                    : 'Not marked'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

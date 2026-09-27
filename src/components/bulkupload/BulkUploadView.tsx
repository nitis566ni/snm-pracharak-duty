import React, { useState } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { downloadBulkMasterTemplate, parseBulkExcelFile } from '../../utils/excelExporter';
import { BulkUploadRow } from '../../types';

export const BulkUploadView: React.FC = () => {
  const {
    sectors,
    branches,
    pracharaks,
    designations,
    satsangs,
    applyBulkImport,
    t,
  } = useApp();

  const [classifiedRows, setClassifiedRows] = useState<BulkUploadRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ added: number; updated: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportSummary(null);

    try {
      const rows = await parseBulkExcelFile(file, {
        sectors,
        branches,
        pracharaks,
        designations,
        satsangs,
      });
      setClassifiedRows(rows);
    } catch (err) {
      console.error(err);
      alert('Error parsing Excel file. Please use the official Master Template.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleConflictApproval = (rowNumber: number) => {
    setClassifiedRows((prev) =>
      prev.map((r) => (r.rowNumber === rowNumber ? { ...r, approved: !r.approved } : r))
    );
  };

  const handleApplyCommit = () => {
    const summary = applyBulkImport(classifiedRows);
    setImportSummary(summary);
  };

  const newCount = classifiedRows.filter((r) => r.status === 'NEW').length;
  const conflictCount = classifiedRows.filter((r) => r.status === 'CONFLICT').length;
  const errorCount = classifiedRows.filter((r) => r.status === 'ERROR').length;
  const approvedConflicts = classifiedRows.filter((r) => r.status === 'CONFLICT' && r.approved).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            {t('navBulkUpload')}
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Non-destructive master data import with 3-way conflict verification & preview
          </p>
        </div>

        <button
          onClick={downloadBulkMasterTemplate}
          className="px-4 py-2 bg-[#E3F8AC] hover:bg-[#d5f096] text-[#0A3A33] text-xs font-bold rounded-full flex items-center gap-2 shadow-xs transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#0F4C42]" />
          <span>{t('downloadTemplate')}</span>
        </button>
      </div>

      {/* Upload Zone & Instructions */}
      <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-[#BCE0D7] hover:border-[#2B8274] transition-all text-center relative">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-14 h-14 rounded-2xl bg-[#EBF7F4] text-[#2B8274] mx-auto flex items-center justify-center mb-3">
          <Upload className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[#0A3A33]">
          {isProcessing ? 'Reading and Validating Workbook...' : t('uploadPrompt')}
        </h3>
        <p className="text-xs text-[#719B93] mt-1 max-w-md mx-auto">
          Supports multi-sheet template (Designations → Sectors → Branches → Pracharaks → Satsangs).
          Existing records are protected against inadvertent overwriting.
        </p>
      </div>

      {/* Success Banner if committed */}
      {importSummary && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Master Data Imported Successfully!</p>
              <p className="text-emerald-700">
                Added {importSummary.added} new records, updated {importSummary.updated} verified existing records.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setClassifiedRows([]);
              setImportSummary(null);
            }}
            className="text-xs font-bold text-emerald-900 underline"
          >
            Clear Preview
          </button>
        </div>
      )}

      {/* 3-Way Classification Stats & Table */}
      {classifiedRows.length > 0 && (
        <div className="space-y-4">
          {/* Classification Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#E2EFEB] shadow-2xs">
              <span className="text-[11px] font-bold text-[#719B93] uppercase">Total Scanned</span>
              <p className="text-2xl font-extrabold font-mono text-[#0A3A33] mt-1">
                {classifiedRows.length}
              </p>
            </div>

            <div className="bg-[#EBF7F4] rounded-2xl p-4 border border-[#CDEAE2] shadow-2xs">
              <span className="text-[11px] font-bold text-[#2B8274] uppercase">New Records</span>
              <p className="text-2xl font-extrabold font-mono text-[#0F4C42] mt-1">
                {newCount}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 uppercase">Conflicts (Needs Approval)</span>
              <p className="text-2xl font-extrabold font-mono text-amber-900 mt-1">
                {conflictCount} <span className="text-xs font-normal">({approvedConflicts} approved)</span>
              </p>
            </div>

            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-800 uppercase">Errors (Skipped)</span>
              <p className="text-2xl font-extrabold font-mono text-rose-900 mt-1">
                {errorCount}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2EFEB] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#0A3A33]">
                  {t('previewAndApprove')}
                </h4>
                <p className="text-xs text-[#719B93]">
                  Inspect each tab row before applying changes.
                </p>
              </div>

              <button
                onClick={handleApplyCommit}
                disabled={newCount === 0 && approvedConflicts === 0}
                className="px-5 py-2 rounded-full bg-[#0F3B38] hover:bg-[#154E4A] disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4F58C]" />
                <span>{t('applyImport')}</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                  <tr>
                    <th className="py-2.5 px-4 w-16">Row</th>
                    <th className="py-2.5 px-4 w-28">Entity Tab</th>
                    <th className="py-2.5 px-4 w-24">Classification</th>
                    <th className="py-2.5 px-4">Row Payload Data</th>
                    <th className="py-2.5 px-4">Conflict / Error Reason</th>
                    <th className="py-2.5 px-4 w-28 text-center">Approve Overwrite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EFEB]">
                  {classifiedRows.map((r) => (
                    <tr key={r.rowNumber} className="hover:bg-[#F9FCFB]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#719B93]">
                        #{r.rowNumber}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#0A3A33]">
                        {r.tab}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            r.status === 'NEW'
                              ? 'bg-emerald-100 text-emerald-900'
                              : r.status === 'CONFLICT'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#4A726B] truncate max-w-xs">
                        {JSON.stringify(r.data)}
                      </td>
                      <td className="py-2.5 px-4 text-[11px]">
                        {r.reason ? (
                          <span
                            className={r.status === 'ERROR' ? 'text-rose-700 font-medium' : 'text-amber-800'}
                          >
                            {r.reason}
                          </span>
                        ) : (
                          <span className="text-emerald-700">Valid new record</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {r.status === 'CONFLICT' ? (
                          <button
                            type="button"
                            onClick={() => toggleConflictApproval(r.rowNumber)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              r.approved
                                ? 'bg-[#0F4C42] text-white shadow-2xs'
                                : 'bg-[#F0F7F5] text-[#4A726B] hover:bg-[#E2EFEB]'
                            }`}
                          >
                            {r.approved ? 'Approved' : 'Approve'}
                          </button>
                        ) : (
                          <span className="text-[#9BB6B0]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

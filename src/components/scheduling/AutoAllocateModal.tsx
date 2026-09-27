import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  Video,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AutoAllocateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutoAllocateModal: React.FC<AutoAllocateModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedYear,
    selectedMonth,
    appSettings,
    specialDays,
    pracharaks,
    runAutoAllocation,
    t,
  } = useApp();

  const [committed, setCommitted] = useState(false);
  const [resultStats, setResultStats] = useState<{ count: number; vicharCount: number } | null>(null);

  if (!isOpen) return null;

  const handleRun = () => {
    const stats = runAutoAllocation(selectedYear, selectedMonth);
    setResultStats(stats);
    setCommitted(true);
  };

  const handleDone = () => {
    setCommitted(false);
    setResultStats(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EFEB] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2EFEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E3F8AC] text-[#0A3A33] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#0F4C42]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A3A33]">
                {t('autoAllocate')}
              </h3>
              <p className="text-xs text-[#4A726B]">
                {selectedYear}-{String(selectedMonth).padStart(2, '0')} Rule-Based Optimization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#4A726B] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!committed ? (
          <div className="py-5 space-y-4">
            <p className="text-xs text-[#0F3B38] leading-relaxed">
              The automated rule engine will evaluate and allocate duties across all active branches in Zone 34 for this month, strictly obeying:
            </p>

            {/* Rules preview list */}
            <div className="space-y-2 text-xs bg-[#F7FCFA] p-4 rounded-2xl border border-[#E2EFEB]">
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 text-[#2B8274] shrink-0 mt-0.5" />
                <span>
                  <strong>Vichar Weeks:</strong> Week(s) {appSettings.vicharWeeks.join(', ')} designated as <em>"Her Holiness Satguru Mata Ji Vichar"</em> (video satsang).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Vishesh Din:</strong> Automatically cancels branch duties coinciding with special Samagam dates.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Layers className="w-4 h-4 text-[#0F4C42] shrink-0 mt-0.5" />
                <span>
                  <strong>Category Limits:</strong> Enforces min/max duties for Categories A+, A, B+, B, C to avoid preacher overload.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-[#2B8274] shrink-0 mt-0.5" />
                <span>
                  <strong>Availability & Holds:</strong> Matches preacher working weekdays and strictly skips dates with active Holds.
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {pracharaks.filter((p) => p.dutyStatus === 'ELIGIBLE' && p.active).length} eligible Pracharaks available for scheduling.
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E3F8AC] text-[#0A3A33] mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#0F4C42]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0A3A33]">
                Allocation Proposed & Committed!
              </h4>
              <p className="text-xs text-[#4A726B] mt-1">
                Successfully assigned {resultStats?.count || 0} satsang duty slots ({resultStats?.vicharCount || 0} Vichar video discourses).
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-3">
          {!committed ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleRun}
                className="px-5 py-2.5 rounded-full bg-[#0F3B38] hover:bg-[#154E4A] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4F58C]" />
                <span>Generate Proposal</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleDone}
              className="px-6 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A] transition-all"
            >
              Done & View Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

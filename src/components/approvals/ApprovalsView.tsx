import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  AlertCircle,
  CheckCheck,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ApprovalsView: React.FC = () => {
  const {
    dutyAllocations,
    branches,
    pracharaks,
    approveDuty,
    rejectDuty,
    approveAllPending,
    t,
    isZoneAdmin,
  } = useApp();

  const [rejectModalDutyId, setRejectModalDutyId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>('');

  const pendingDuties = dutyAllocations.filter((d) => d.approvalStatus === 'PENDING');

  const handleConfirmReject = () => {
    if (rejectModalDutyId) {
      rejectDuty(rejectModalDutyId, rejectNotes);
      setRejectModalDutyId(null);
      setRejectNotes('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
              {t('navApprovals')}
            </h2>
            <span className="bg-amber-100 text-amber-900 font-mono text-xs font-bold px-2 py-0.5 rounded-full border border-amber-300">
              {pendingDuties.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Zone Admin approval queue for Local and Other-Zone Pracharak allocations
          </p>
        </div>

        {pendingDuties.length > 0 && isZoneAdmin && (
          <button
            onClick={approveAllPending}
            className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-xs transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4 text-[#D4F58C]" />
            <span>{t('approveAll')}</span>
          </button>
        )}
      </div>

      {/* Pending Items Grid */}
      {pendingDuties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2EFEB] shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#EBF7F4] text-[#2B8274] mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#0A3A33]">
            No Pending Approvals
          </h3>
          <p className="text-xs text-[#719B93] max-w-sm mx-auto mt-1">
            All submitted local and other-zone pracharak duties are up to date and verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingDuties.map((duty) => {
            const branch = branches.find((b) => b.id === duty.branchId);

            return (
              <div
                key={duty.id}
                className="bg-white rounded-3xl p-5 border border-[#E2EFEB] shadow-xs flex flex-col justify-between hover:border-[#2B8274]/40 transition-all"
              >
                <div>
                  {/* Top line with Date and Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-extrabold text-[#0A3A33] bg-[#F0F7F5] px-2.5 py-1 rounded-lg">
                      {duty.date}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        duty.type === 'local'
                          ? 'bg-[#E3F8AC] text-[#0A3A33]'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {duty.type === 'local' ? t('duty_local') : t('duty_other_zone')}
                    </span>
                  </div>

                  {/* Branch & Satsang details */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0A3A33]">
                      <Building className="w-4 h-4 text-[#2B8274] shrink-0" />
                      <span>{branch?.name} ({branch?.code})</span>
                    </div>
                    <p className="text-[11px] text-[#719B93] pl-6">
                      Sthal: {branch?.satsangBhavan}
                    </p>
                  </div>

                  {/* Proposed Preacher Details */}
                  <div className="bg-[#FAFDFB] p-3.5 rounded-2xl border border-[#E2EFEB] text-xs space-y-1">
                    <span className="block text-[10px] font-bold uppercase text-[#4A726B]">
                      Submitted Preacher
                    </span>
                    <p className="font-extrabold text-[#0A3A33] text-sm">
                      {duty.type === 'local' ? duty.localPracharakName : duty.otherZoneDetails}
                    </p>
                    <p className="text-[11px] text-[#719B93]">
                      Requested by: {duty.allocatedBy}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
                  <button
                    onClick={() => setRejectModalDutyId(duty.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t('reject')}</span>
                  </button>
                  <button
                    onClick={() => approveDuty(duty.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A3A33] bg-[#E3F8AC] hover:bg-[#d8f58c] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0F4C42]" />
                    <span>{t('approve')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalDutyId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2EFEB]">
            <h3 className="text-base font-bold text-[#0A3A33] mb-2">
              Reject Duty Proposal
            </h3>
            <p className="text-xs text-[#4A726B] mb-4">
              Please provide a reason so the Branch Mukhi can make an alternative arrangement.
            </p>
            <textarea
              rows={3}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Other-Zone clearance not received / Local preacher clash..."
              className="w-full p-3 rounded-xl border border-[#D5E8E3] text-xs text-[#0A3A33] focus:outline-none focus:ring-2 focus:ring-rose-400 mb-4 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalDutyId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

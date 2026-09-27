import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  UserCheck,
  MessageSquare,
  X,
  Clock,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, DutyAllocation } from '../../types';

interface AttendanceModalProps {
  duty: DutyAllocation;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceFeedbackModal: React.FC<AttendanceModalProps> = ({
  duty,
  isOpen,
  onClose,
}) => {
  const { markAttendance, branches, pracharaks, t } = useApp();

  const [attendance, setAttendance] = useState<AttendanceStatus>(duty.attendance || 'PRESENT');
  const [actualPerformer, setActualPerformer] = useState(duty.actualPerformer || '');
  const [feedback, setFeedback] = useState(duty.feedback || '');

  if (!isOpen) return null;

  const branch = branches.find((b) => b.id === duty.branchId);
  const pracharak = pracharaks.find((p) => p.id === duty.pracharakId);

  const handleSave = () => {
    markAttendance(duty.id, attendance, actualPerformer, feedback);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EFEB] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2EFEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E3F8AC] text-[#0A3A33] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5 text-[#0F4C42]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A3A33]">
                {t('markAttendance')}
              </h3>
              <p className="text-xs text-[#4A726B]">
                {duty.date} · {branch?.name}
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
        <div className="py-5 space-y-4">
          {/* Duty Context Info */}
          <div className="bg-[#F5FBF9] p-3.5 rounded-2xl border border-[#DDEFEA] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#4A726B]">Scheduled Duty:</span>
              <span className="font-bold text-[#0A3A33]">
                {duty.type === 'vichar'
                  ? t('duty_vichar')
                  : duty.type === 'local'
                  ? `${t('duty_local')}: ${duty.localPracharakName || ''}`
                  : duty.type === 'other_zone'
                  ? `${t('duty_other_zone')}: ${duty.otherZoneDetails || ''}`
                  : pracharak?.name || 'Assigned Preacher'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#719B93]">
              <span>Branch Sthal:</span>
              <span className="truncate max-w-[240px]">{branch?.satsangBhavan}</span>
            </div>
          </div>

          {/* Attendance Selection: Present / Absent */}
          <div>
            <label className="block text-xs font-bold text-[#0A3A33] mb-2">
              Attendance Verification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAttendance('PRESENT')}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
                  attendance === 'PRESENT'
                    ? 'bg-[#E3F8AC] text-[#0A3A33] border-[#BDE868] shadow-xs'
                    : 'bg-white text-[#4A726B] border-[#D5E8E3] hover:bg-[#F0F7F5]'
                }`}
              >
                <CheckCircle className={`w-4 h-4 ${attendance === 'PRESENT' ? 'text-[#0F4C42]' : 'text-emerald-500'}`} />
                <span>{t('status_present')}</span>
              </button>

              <button
                type="button"
                onClick={() => setAttendance('ABSENT')}
                className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all border ${
                  attendance === 'ABSENT'
                    ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                    : 'bg-white text-[#4A726B] border-[#D5E8E3] hover:bg-[#F0F7F5]'
                }`}
              >
                <XCircle className={`w-4 h-4 ${attendance === 'ABSENT' ? 'text-rose-700' : 'text-rose-400'}`} />
                <span>{t('status_absent')}</span>
              </button>
            </div>
          </div>

          {/* If Absent: Who performed the duty instead? (FR-AT-2) */}
          {attendance === 'ABSENT' && (
            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200 space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-rose-950">
                {t('whoPerformedInstead')} *
              </label>
              <input
                type="text"
                value={actualPerformer}
                onChange={(e) => setActualPerformer(e.target.value)}
                placeholder="e.g. Rev. Ashok Kadam Ji (Substitute) or Local Sangat Mukhi"
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-rose-300 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <p className="text-[11px] text-rose-700">
                Required for accurate zone archives when the scheduled pracharak could not attend.
              </p>
            </div>
          )}

          {/* Feedback & Sangat Notes (FR-AT-3) */}
          <div>
            <label className="block text-xs font-bold text-[#0A3A33] mb-1.5">
              {t('feedbackNotes')}
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Record congregation attendance numbers, sound setup notes, inspiring discourse highlights..."
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#D5E8E3] text-[#0F3B38] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30 resize-none"
            />
          </div>

          {duty.attendanceMarkedBy && (
            <div className="text-[11px] text-[#719B93] flex items-center justify-between border-t border-[#E2EFEB] pt-2">
              <span>{t('markedBy')}: {duty.attendanceMarkedBy}</span>
              <span>{duty.attendanceMarkedAt ? new Date(duty.attendanceMarkedAt).toLocaleDateString() : ''}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5] transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full bg-[#0F3B38] hover:bg-[#154E4A] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

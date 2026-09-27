import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Save,
  MessageSquare,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';

export const AttendanceView: React.FC = () => {
  const {
    dutyAllocations,
    branches,
    pracharaks,
    markAttendance,
    isZoneAdmin,
    currentUser,
    t,
  } = useApp();

  // Local state for each duty card form
  const [formData, setFormData] = useState<Record<string, {
    attendance: AttendanceStatus;
    actualPerformer: string;
    feedback: string;
    savedNotice?: boolean;
  }>>({});

  const [filterBranchId, setFilterBranchId] = useState<string>('all');

  // Filter duties for attendance (past or current duties)
  const pastDuties = dutyAllocations
    .filter((d) => {
      if (!isZoneAdmin && d.branchId !== currentUser.branchId) return false;
      if (filterBranchId !== 'all' && d.branchId !== filterBranchId) return false;
      return d.type !== 'no_satsang';
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getDutyForm = (dutyId: string, currentDuty: any) => {
    return formData[dutyId] || {
      attendance: currentDuty.attendance || 'UNMARKED',
      actualPerformer: currentDuty.actualPerformer || '',
      feedback: currentDuty.feedback || '',
    };
  };

  const updateDutyField = (dutyId: string, field: string, value: any, currentDuty: any) => {
    const prev = getDutyForm(dutyId, currentDuty);
    setFormData((old) => ({
      ...old,
      [dutyId]: {
        ...prev,
        [field]: value,
      },
    }));
  };

  const handleSaveDuty = (dutyId: string, currentDuty: any) => {
    const cur = getDutyForm(dutyId, currentDuty);
    markAttendance(dutyId, cur.attendance, cur.actualPerformer, cur.feedback);

    // Show temporary saved indicator
    setFormData((old) => ({
      ...old,
      [dutyId]: {
        ...cur,
        savedNotice: true,
      },
    }));

    setTimeout(() => {
      setFormData((old) => {
        if (!old[dutyId]) return old;
        return {
          ...old,
          [dutyId]: {
            ...old[dutyId],
            savedNotice: false,
          },
        };
      });
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            Attendance & Feedback
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Mark whether the Pracharak attended each past duty. If absent, record who actually performed it.
          </p>
        </div>

        {/* Branch Filter */}
        {isZoneAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#4A726B] font-semibold">Branch:</span>
            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              className="bg-white border border-[#D5E8E3] rounded-xl px-3 py-1.5 text-xs text-[#0A3A33] font-medium focus:outline-none shadow-2xs"
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
      </div>

      {/* Duty Cards matching screenshot 11 */}
      <div className="space-y-4">
        {pastDuties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E2EFEB] shadow-xs">
            <p className="text-sm text-[#719B93]">No duties found for attendance marking.</p>
          </div>
        ) : (
          pastDuties.map((duty) => {
            const branch = branches.find((b) => b.id === duty.branchId);
            const pr = pracharaks.find((p) => p.id === duty.pracharakId);
            const form = getDutyForm(duty.id, duty);
            const weekdayName = new Date(duty.date).toLocaleDateString('en-US', { weekday: 'long' });

            return (
              <div
                key={duty.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EFEB] shadow-xs hover:border-[#2B8274]/30 transition-all space-y-4"
              >
                {/* Header row of card (as in screenshot 11) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2EFEB]">
                  <div>
                    <h3 className="text-sm font-bold text-[#0A3A33]">
                      {duty.date} · {weekdayName} — {branch?.name}
                    </h3>
                    <p className="text-xs text-[#719B93]">
                      {branch?.satsangBhavan} ·{' '}
                      <span className="font-semibold text-[#0F4C42]">
                        {duty.type === 'vichar'
                          ? 'Satguru Mata Ji Vichar'
                          : pr?.name || duty.localPracharakName || duty.otherZoneDetails || 'Assigned Preacher'}
                      </span>
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {form.attendance === 'PRESENT' ? (
                      <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                        Present
                      </span>
                    ) : form.attendance === 'ABSENT' ? (
                      <span className="bg-rose-50 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200">
                        Absent
                      </span>
                    ) : (
                      <span className="bg-[#F0F7F5] text-[#719B93] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#D5E8E3]">
                        Not marked
                      </span>
                    )}
                  </div>
                </div>

                {/* Radio selection: Present vs Absent */}
                <div className="flex items-center gap-6 text-xs font-semibold text-[#0A3A33]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`att-${duty.id}`}
                      checked={form.attendance === 'PRESENT'}
                      onChange={() => updateDutyField(duty.id, 'attendance', 'PRESENT', duty)}
                      className="text-[#0F4C42] focus:ring-0"
                    />
                    <span>Present</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`att-${duty.id}`}
                      checked={form.attendance === 'ABSENT'}
                      onChange={() => updateDutyField(duty.id, 'attendance', 'ABSENT', duty)}
                      className="text-rose-600 focus:ring-0"
                    />
                    <span>Absent</span>
                  </label>
                </div>

                {/* If Absent: Substitute performer selector (from screenshot 11) */}
                {form.attendance === 'ABSENT' && (
                  <div className="space-y-1 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 animate-fadeIn">
                    <label className="block text-xs font-bold text-rose-950">
                      Who actually performed the duty (Substitute):
                    </label>
                    <select
                      value={form.actualPerformer}
                      onChange={(e) => updateDutyField(duty.id, 'actualPerformer', e.target.value, duty)}
                      className="w-full p-2 bg-white text-xs border border-rose-300 rounded-xl text-rose-900 focus:outline-none"
                    >
                      <option value="">-- Select Substitute Preacher --</option>
                      {pracharaks.map((p) => (
                        <option key={p.id} value={`${p.name} (${p.code})`}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Feedback input */}
                <div>
                  <input
                    type="text"
                    value={form.feedback}
                    onChange={(e) => updateDutyField(duty.id, 'feedback', e.target.value, duty)}
                    placeholder="Feedback (optional) e.g. Attendance numbers, discourse highlights..."
                    className="w-full px-3 py-2 text-xs bg-[#FAFDFB] rounded-xl border border-[#D5E8E3] text-[#0A3A33] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30"
                  />
                </div>

                {/* Save button & notice */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleSaveDuty(duty.id, duty)}
                    className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5 text-[#D4F58C]" />
                    <span>Save</span>
                  </button>

                  {form.savedNotice && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved!</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

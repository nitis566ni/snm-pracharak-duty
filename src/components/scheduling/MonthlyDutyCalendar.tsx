import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  Sparkles,
  Filter,
  CheckCircle,
  Clock,
  Video,
  AlertCircle,
  User,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DutyAllocation, DutyType, Branch, Satsang } from '../../types';
import { AutoAllocateModal } from './AutoAllocateModal';
import { AttendanceFeedbackModal } from '../attendance/AttendanceFeedbackModal';
import { exportDutyChartExcel } from '../../utils/excelExporter';

export const MonthlyDutyCalendar: React.FC = () => {
  const {
    selectedYear,
    selectedMonth,
    setSelectedMonth,
    isMonthFrozen,
    currentMonthFreeze,
    isZoneAdmin,
    currentUser,
    userBranch,
    branches,
    sectors,
    pracharaks,
    satsangs,
    dutyAllocations,
    appSettings,
    allocateDuty,
    deleteDuty,
    isPracharakOnHold,
    getSatsangDatesForMonth,
    t,
    lang,
  } = useApp();

  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    isZoneAdmin ? 'all' : currentUser.branchId || 'all'
  );

  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{
    date: string;
    branch: Branch;
    satsang: Satsang;
    duty?: DutyAllocation;
    existingDuty?: DutyAllocation;
    weekNumber: number;
    isVisheshDin: boolean;
    visheshDinName?: string;
  } | null>(null);

  const [attendanceDuty, setAttendanceDuty] = useState<DutyAllocation | null>(null);

  // Form states for allocation modal
  const [dutyType, setDutyType] = useState<DutyType>('pracharak');
  const [selectedPracharakId, setSelectedPracharakId] = useState<string>('');
  const [localPracharakName, setLocalPracharakName] = useState<string>('');
  const [otherZoneDetails, setOtherZoneDetails] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [allocationError, setAllocationError] = useState<string>('');

  // Satsang dates list for this month
  const targetBranch = isZoneAdmin ? (selectedBranchId !== 'all' ? selectedBranchId : undefined) : currentUser.branchId;
  const allMonthSlots = getSatsangDatesForMonth(selectedYear, selectedMonth, targetBranch);

  // Filter by sector if chosen
  const filteredSlots = allMonthSlots.filter((slot) => {
    if (selectedSectorId !== 'all' && slot.branch.sectorId !== selectedSectorId) {
      return false;
    }
    return true;
  });

  // Open Edit Modal for a slot
  const handleOpenEdit = (slot: any) => {
    if (isMonthFrozen && !isZoneAdmin) return;
    if (!isZoneAdmin && slot.branch.id !== currentUser.branchId) return;

    setEditingSlot(slot);
    setAllocationError('');
    if (slot.existingDuty) {
      setDutyType(slot.existingDuty.type);
      setSelectedPracharakId(slot.existingDuty.pracharakId || '');
      setLocalPracharakName(slot.existingDuty.localPracharakName || '');
      setOtherZoneDetails(slot.existingDuty.otherZoneDetails || '');
      setOverrideReason(slot.existingDuty.overrideReason || '');
    } else {
      setDutyType('pracharak');
      setSelectedPracharakId('');
      setLocalPracharakName('');
      setOtherZoneDetails('');
      setOverrideReason('');
    }
  };

  const handleSaveAllocation = () => {
    if (!editingSlot) return;

    if (dutyType === 'pracharak' && !selectedPracharakId) {
      setAllocationError('Please select a Pracharak.');
      return;
    }

    if (dutyType === 'local' && !localPracharakName.trim()) {
      setAllocationError('Please specify the Local Pracharak name.');
      return;
    }

    if (dutyType === 'other_zone' && !otherZoneDetails.trim()) {
      setAllocationError('Please provide Other-Zone Pracharak name & Zone details.');
      return;
    }

    const res = allocateDuty({
      date: editingSlot.date,
      branchId: editingSlot.branch.id,
      satsangId: editingSlot.satsang.id,
      type: dutyType,
      pracharakId: dutyType === 'pracharak' ? selectedPracharakId : undefined,
      localPracharakName: dutyType === 'local' ? localPracharakName : undefined,
      otherZoneDetails: dutyType === 'other_zone' ? otherZoneDetails : undefined,
      overrideReason: overrideReason.trim() ? overrideReason : undefined,
    });

    if (!res.success) {
      setAllocationError(res.message || 'Allocation failed rule constraint.');
      return;
    }

    setEditingSlot(null);
  };

  const handleDeleteAllocation = () => {
    if (editingSlot?.existingDuty) {
      deleteDuty(editingSlot.existingDuty.id);
      setEditingSlot(null);
    }
  };

  // Group slots by branch or date
  const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            {t('navCalendar')} — {monthName}
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Zone 34 Satsang Congregation schedule & duty matrix
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isZoneAdmin && (
            <button
              onClick={() => setIsAutoModalOpen(true)}
              className="px-4 py-2 bg-[#E3F8AC] hover:bg-[#d5f096] text-[#0A3A33] text-xs font-bold rounded-full flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0F4C42]" />
              <span>{t('autoAllocate')}</span>
            </button>
          )}

          <button
            onClick={() =>
              exportDutyChartExcel(
                dutyAllocations.filter((d) => {
                  const dt = new Date(d.date);
                  return dt.getFullYear() === selectedYear && dt.getMonth() + 1 === selectedMonth;
                }),
                branches,
                pracharaks,
                monthName,
                lang
              )
            }
            className="px-3.5 py-2 bg-white hover:bg-[#F0F7F5] text-[#0A3A33] text-xs font-semibold rounded-full border border-[#D5E8E3] flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2B8274]" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Freeze Notice (FR-FZ-1..3) */}
      {isMonthFrozen && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <p className="font-bold">
                {t('monthFrozenNotice')}
              </p>
              <p className="text-[11px] text-amber-700">
                Frozen by {currentMonthFreeze?.frozenBy} on{' '}
                {currentMonthFreeze?.frozenAt ? new Date(currentMonthFreeze.frozenAt).toLocaleDateString() : ''}. Edits are restricted to read-only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mukhi Permitted Weeks Reminder (FR-SCH-3) */}
      {!isZoneAdmin && (
        <div className="p-3 bg-[#E8F6F2] border border-[#CDEAE2] rounded-2xl flex items-center gap-2.5 text-xs text-[#0F4C42]">
          <Building className="w-4 h-4 text-[#2B8274] shrink-0" />
          <span>
            {t('mukhiRestrictedNotice')}{' '}
            <strong className="underline">
              Weeks {appSettings.mukhiFillableWeeks.join(', ')}
            </strong>
            . Other weeks are managed by Zone Coordinator.
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2EFEB] shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#4A726B] font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Sector Filter */}
          {isZoneAdmin && (
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className="bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-1.5 text-xs text-[#0A3A33] font-medium focus:outline-none"
            >
              <option value="all">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          )}

          {/* Branch Filter */}
          {isZoneAdmin ? (
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-[#F0F7F5] border border-[#D5E8E3] rounded-xl px-3 py-1.5 text-xs text-[#0A3A33] font-medium focus:outline-none"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          ) : (
            <span className="font-bold text-[#0A3A33] bg-[#E3F8AC] px-2.5 py-1 rounded-lg">
              {userBranch?.name} ({userBranch?.code})
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[#4A726B] font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2B8274]" /> Pracharak
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#82C341]" /> Satguru Mata Ji Vichar
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Pending Approval
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Absent / Substitute
          </span>
        </div>
      </div>

      {/* Satsang Duty Matrix Table */}
      <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                <th className="py-3.5 px-4 w-28">Date</th>
                <th className="py-3.5 px-4">Branch / Sangat</th>
                <th className="py-3.5 px-4 w-32">Time</th>
                <th className="py-3.5 px-4">Allocated Duty / Preacher</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-28">Attendance</th>
                <th className="py-3.5 px-4 w-24 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF4F2]">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#719B93]">
                    No satsang slots found for selected filters in this month.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot, idx) => {
                  const duty = slot.existingDuty;
                  const pr = duty?.pracharakId ? pracharaks.find((p) => p.id === duty.pracharakId) : null;
                  const canMukhiEdit = !isZoneAdmin && appSettings.mukhiFillableWeeks.includes(slot.weekNumber);
                  const canEdit = isZoneAdmin ? !isMonthFrozen : (!isMonthFrozen && canMukhiEdit);

                  return (
                    <tr
                      key={`${slot.date}-${slot.branch.id}-${slot.satsang.id}`}
                      className="hover:bg-[#F9FCFB] transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-[#0A3A33]">
                          {slot.date}
                        </div>
                        <div className="text-[10px] text-[#719B93]">
                          Week {slot.weekNumber} · {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.weekday]}
                        </div>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0A3A33]">
                          {slot.branch.name}
                        </div>
                        <div className="text-[11px] text-[#719B93] truncate max-w-xs">
                          {slot.satsang.name}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3 px-4 font-mono tabular-nums text-[#4A726B]">
                        {slot.satsang.time}
                      </td>

                      {/* Allocated Duty / Preacher */}
                      <td className="py-3 px-4">
                        {slot.isVisheshDin ? (
                          <div className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 inline-block">
                            Vishesh Din: {slot.visheshDinName}
                          </div>
                        ) : !duty || duty.type === 'unfilled' ? (
                          <span className="text-[#9BB6B0] italic">
                            {t('duty_unfilled')}
                          </span>
                        ) : duty.type === 'vichar' ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 inline-flex">
                            <Video className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t('duty_vichar')}</span>
                          </div>
                        ) : duty.type === 'local' ? (
                          <div>
                            <span className="font-bold text-[#0A3A33]">
                              {duty.localPracharakName}
                            </span>
                            <span className="ml-1.5 text-[10px] bg-[#E3F8AC] text-[#0A3A33] px-1.5 py-0.5 rounded-md font-semibold">
                              {t('duty_local')}
                            </span>
                          </div>
                        ) : duty.type === 'other_zone' ? (
                          <div>
                            <span className="font-bold text-[#0A3A33]">
                              {duty.otherZoneDetails}
                            </span>
                            <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded-md font-semibold">
                              {t('duty_other_zone')}
                            </span>
                          </div>
                        ) : duty.type === 'no_satsang' ? (
                          <span className="text-slate-500 italic">
                            {t('duty_no_satsang')}
                          </span>
                        ) : (
                          <div>
                            <div className="font-bold text-[#0A3A33] flex items-center gap-1.5">
                              <span>{pr?.name || 'Preacher'}</span>
                              <span className="text-[10px] bg-[#F0F7F5] border border-[#D5E8E3] text-[#0F4C42] px-1.5 py-0.2 rounded font-mono font-bold">
                                {pr?.category}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#719B93]">
                              {pr?.code} · {pr?.phone}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3 px-4">
                        {duty ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              duty.approvalStatus === 'APPROVED'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : duty.approvalStatus === 'PENDING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {duty.approvalStatus}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9BB6B0]">—</span>
                        )}
                      </td>

                      {/* Attendance */}
                      <td className="py-3 px-4">
                        {duty && duty.type !== 'no_satsang' ? (
                          <button
                            onClick={() => setAttendanceDuty(duty)}
                            className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors ${
                              duty.attendance === 'PRESENT'
                                ? 'bg-[#E3F8AC] text-[#0A3A33] hover:bg-[#d8f58c]'
                                : duty.attendance === 'ABSENT'
                                ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                                : 'bg-[#F0F7F5] text-[#4A726B] hover:bg-[#E2EFEB]'
                            }`}
                            title="Click to Record or Update Attendance"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>
                              {duty.attendance === 'PRESENT'
                                ? t('status_present')
                                : duty.attendance === 'ABSENT'
                                ? t('status_absent')
                                : 'Record'}
                            </span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#9BB6B0]">—</span>
                        )}
                      </td>

                      {/* Action (Edit / Assign) */}
                      <td className="py-3 px-4 text-right">
                        {canEdit && !slot.isVisheshDin ? (
                          <button
                            onClick={() => handleOpenEdit(slot)}
                            className="p-1.5 rounded-lg bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#0A3A33] transition-colors"
                            title={duty ? 'Edit Allocation' : 'Assign Duty'}
                          >
                            {duty ? (
                              <Edit2 className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isMonthFrozen ? 'Locked' : 'Restricted'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Duty Allocation Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EFEB] relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFEB]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E3F8AC] text-[#0A3A33] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5 text-[#0F4C42]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A3A33]">
                    {t('allocateModalTitle')}
                  </h3>
                  <p className="text-xs text-[#4A726B]">
                    {editingSlot.date} · {editingSlot.branch.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingSlot(null)}
                className="w-8 h-8 rounded-full bg-[#F0F7F5] hover:bg-[#E2EFEB] text-[#4A726B] flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="py-4 space-y-4 text-xs">
              {allocationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{allocationError}</span>
                </div>
              )}

              {/* Duty Type */}
              <div>
                <label className="block font-bold text-[#0A3A33] mb-1.5">
                  {t('selectDutyType')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'pracharak', label: t('duty_pracharak') },
                    { id: 'vichar', label: t('duty_vichar') },
                    { id: 'local', label: t('duty_local') },
                    { id: 'other_zone', label: t('duty_other_zone') },
                    { id: 'no_satsang', label: t('duty_no_satsang') },
                  ].map((tOption) => (
                    <button
                      key={tOption.id}
                      type="button"
                      onClick={() => setDutyType(tOption.id as DutyType)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        dutyType === tOption.id
                          ? 'bg-[#E3F8AC] text-[#0A3A33] font-bold border-[#BDE868] shadow-2xs'
                          : 'bg-white text-[#4A726B] border-[#D5E8E3] hover:bg-[#F0F7F5]'
                      }`}
                    >
                      {tOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pracharak Select (Hiding on-hold pracharaks as per FR-SCH-4) */}
              {dutyType === 'pracharak' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#0A3A33]">
                      {t('selectPracharak')}
                    </label>
                    <span className="text-[10px] text-[#719B93]">
                      {t('onHoldNotice')}
                    </span>
                  </div>
                  <select
                    value={selectedPracharakId}
                    onChange={(e) => setSelectedPracharakId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs text-[#0A3A33] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30"
                  >
                    <option value="">-- Choose Pracharak --</option>
                    {pracharaks
                      .filter((p) => {
                        if (!p.active) return false;
                        // Hide if on hold on this date UNLESS currently assigned to this slot
                        const onHold = isPracharakOnHold(p.id, editingSlot.date);
                        if (onHold && editingSlot.existingDuty?.pracharakId !== p.id) {
                          return false;
                        }
                        return true;
                      })
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code}) — Cat {p.category} [
                          {p.workingWeekdays.map((w) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w]).join(', ')}]
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Local Pracharak input */}
              {dutyType === 'local' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0A3A33]">
                    Local Pracharak Name
                  </label>
                  <input
                    type="text"
                    value={localPracharakName}
                    onChange={(e) => setLocalPracharakName(e.target.value)}
                    placeholder="e.g. Rev. Santosh Mhaske (Camp Sangat)"
                    className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs text-[#0A3A33] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30"
                  />
                  {!isZoneAdmin && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Note: Local Pracharak duties submitted by Mukhi will require Zone Admin approval.
                    </p>
                  )}
                </div>
              )}

              {/* Other Zone Pracharak input */}
              {dutyType === 'other_zone' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#0A3A33]">
                    Other-Zone Pracharak Name & Zone
                  </label>
                  <input
                    type="text"
                    value={otherZoneDetails}
                    onChange={(e) => setOtherZoneDetails(e.target.value)}
                    placeholder="e.g. Rev. Kuldeep Vohra Ji (Zone 11, Delhi Central)"
                    className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs text-[#0A3A33] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30"
                  />
                  {!isZoneAdmin && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Note: Other-Zone Pracharak requests require Zone Admin approval.
                    </p>
                  )}
                </div>
              )}

              {/* Admin Override Reason (FR-AA-5) */}
              {isZoneAdmin && (
                <div className="pt-2 border-t border-[#E2EFEB]">
                  <label className="font-bold text-[#0A3A33] mb-1 block">
                    {t('overrideReason')} (Optional)
                  </label>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Special Zonal Request / Preacher agreed for extra duty"
                    className="w-full p-2 bg-[#F9FCFB] border border-[#D5E8E3] rounded-xl text-xs text-[#0F3B38]"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E2EFEB] flex items-center justify-between">
              {editingSlot.existingDuty ? (
                <button
                  type="button"
                  onClick={handleDeleteAllocation}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Duty</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllocation}
                  className="px-5 py-2.5 rounded-full bg-[#0F3B38] hover:bg-[#154E4A] text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto Allocate Modal */}
      <AutoAllocateModal
        isOpen={isAutoModalOpen}
        onClose={() => setIsAutoModalOpen(false)}
      />

      {/* Attendance & Feedback Modal */}
      {attendanceDuty && (
        <AttendanceFeedbackModal
          duty={attendanceDuty}
          isOpen={!!attendanceDuty}
          onClose={() => setAttendanceDuty(null)}
        />
      )}
    </div>
  );
};

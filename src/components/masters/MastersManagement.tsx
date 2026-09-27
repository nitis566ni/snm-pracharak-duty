import React, { useState } from 'react';
import {
  Layers,
  Building,
  Users,
  Award,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Sector,
  Branch,
  Pracharak,
  Designation,
  Satsang,
  PracharakHold,
  PracharakCategory,
} from '../../types';

export const MastersManagement: React.FC = () => {
  const {
    sectors,
    branches,
    pracharaks,
    designations,
    satsangs,
    holds,
    saveSector,
    deleteSector,
    saveBranch,
    deleteBranch,
    savePracharak,
    deletePracharak,
    saveDesignation,
    deleteDesignation,
    saveSatsang,
    deleteSatsang,
    saveHold,
    deleteHold,
    t,
  } = useApp();

  const [activeMasterTab, setActiveMasterTab] = useState<
    'pracharaks' | 'branches' | 'sectors' | 'designations' | 'satsangs' | 'holds'
  >('pracharaks');

  const [searchTerm, setSearchTerm] = useState('');

  // Modals for editing
  const [editingPracharak, setEditingPracharak] = useState<Partial<Pracharak> | null>(null);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);
  const [editingSector, setEditingSector] = useState<Partial<Sector> | null>(null);
  const [editingDesignation, setEditingDesignation] = useState<Partial<Designation> | null>(null);
  const [editingHold, setEditingHold] = useState<Partial<PracharakHold> | null>(null);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            {t('navMasters')}
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Zone structure, branches, pracharaks, designations & availability holds
          </p>
        </div>

        {/* Master Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#F0F7F5] p-1 rounded-2xl border border-[#D5E8E3] overflow-x-auto">
          {[
            { id: 'pracharaks', label: t('tabPracharaks'), icon: Users },
            { id: 'branches', label: t('tabBranches'), icon: Building },
            { id: 'sectors', label: t('tabSectors'), icon: Layers },
            { id: 'designations', label: t('tabDesignations'), icon: Award },
            { id: 'holds', label: t('tabHolds'), icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMasterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMasterTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F4C42] text-white shadow-2xs'
                    : 'text-[#4A726B] hover:text-[#0A3A33] hover:bg-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PRACHARAKS TAB */}
      {activeMasterTab === 'pracharaks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-[#719B93] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search preacher by name, code, phone..."
                className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-[#0A3A33] rounded-xl border border-[#D5E8E3] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30"
              />
            </div>
            <button
              onClick={() =>
                setEditingPracharak({
                  name: '',
                  code: `PR-${100 + pracharaks.length + 1}`,
                  category: 'B',
                  gender: 'MALE',
                  age: 45,
                  phone: '',
                  residenceAddress: '',
                  dutyStatus: 'ELIGIBLE',
                  workingWeekdays: [0],
                  isGyanPracharak: false,
                  active: true,
                })
              }
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('add')} Pracharak</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                    <th className="py-3 px-4 w-20">Code</th>
                    <th className="py-3 px-4">Name & Designation</th>
                    <th className="py-3 px-4 w-16">Cat</th>
                    <th className="py-3 px-4">Working Days</th>
                    <th className="py-3 px-4">Contact & Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF4F2]">
                  {pracharaks
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.code.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((p) => {
                      const des = designations.find((d) => d.id === p.designationId);
                      const hasActiveHold = holds.some((h) => h.pracharakId === p.id);

                      return (
                        <tr key={p.id} className="hover:bg-[#F9FCFB] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#0A3A33]">
                            {p.code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0A3A33] flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.isGyanPracharak && (
                                <span className="text-[10px] bg-[#E3F8AC] text-[#0A3A33] px-1.5 py-0.2 rounded font-semibold">
                                  Gyan
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#719B93]">
                              {des?.name || 'Pracharak'} · Age {p.age}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#0F4C42]">
                            {p.category}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {p.workingWeekdays.map((w) => (
                                <span
                                  key={w}
                                  className="bg-[#F0F7F5] border border-[#D5E8E3] text-[#0A3A33] px-1.5 py-0.5 rounded text-[10px] font-bold"
                                >
                                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][w]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[#0A3A33] font-medium">{p.phone}</div>
                            <div className="text-[11px] text-[#719B93] truncate max-w-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#2B8274] shrink-0" />
                              <span className="truncate">{p.residenceAddress}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {hasActiveHold ? (
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                On Hold
                              </span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Eligible
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingPracharak(p)}
                                className="p-1 rounded-md text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deletePracharak(p.id)}
                                className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. BRANCHES TAB */}
      {activeMasterTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0A3A33]">Zone 34 Branches & Sangats</h3>
            <button
              onClick={() =>
                setEditingBranch({
                  code: `PN-0${branches.length + 1}`,
                  name: '',
                  sectorId: sectors[0]?.id || '',
                  satsangWeekday: 0,
                  registrationStatus: 'REGISTERED',
                  mukhiName: '',
                  mukhiContact: '',
                  satsangBhavan: '',
                  address: '',
                  active: true,
                })
              }
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('add')} Branch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => {
              const sec = sectors.find((s) => s.id === b.sectorId);
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-[#E2EFEB] shadow-xs flex flex-col justify-between hover:border-[#2B8274]/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-extrabold text-[#0A3A33] bg-[#E3F8AC] px-2 py-0.5 rounded-md">
                        {b.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F0F7F5] text-[#0F4C42]">
                        {b.registrationStatus}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0A3A33] mb-1">
                      {b.name}
                    </h4>
                    <p className="text-[11px] text-[#4A726B] mb-2 font-medium">
                      Sector: {sec?.name || 'Sector'} · Regular Day:{' '}
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][b.satsangWeekday]}
                    </p>

                    <div className="space-y-1 text-xs text-[#719B93] bg-[#FAFDFB] p-3 rounded-2xl border border-[#E2EFEB]">
                      <p>
                        <strong className="text-[#0A3A33]">Mukhi/Prabandhak:</strong> {b.mukhiName} ({b.mukhiContact})
                      </p>
                      <p className="truncate">
                        <strong className="text-[#0A3A33]">Bhavan:</strong> {b.satsangBhavan}
                      </p>
                      <p className="truncate text-[11px]">
                        <strong className="text-[#0A3A33]">Address:</strong> {b.address}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingBranch(b)}
                      className="p-1.5 rounded-lg text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBranch(b.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SECTORS TAB */}
      {activeMasterTab === 'sectors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0A3A33]">Zone 34 Sanyojak Kshetras (Sectors)</h3>
            <button
              onClick={() =>
                setEditingSector({
                  code: `SEC-0${sectors.length + 1}`,
                  name: '',
                  sanyojakName: '',
                  sanyojakContact: '',
                  active: true,
                })
              }
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('add')} Sector</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectors.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-[#E2EFEB] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-extrabold text-[#0A3A33] bg-[#E3F8AC] px-2 py-0.5 rounded-md">
                      {s.code}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0A3A33] mb-1">{s.name}</h4>
                  <div className="text-xs text-[#719B93] space-y-1 mt-2">
                    <p>
                      <strong className="text-[#0A3A33]">Sanyojak:</strong> {s.sanyojakName}
                    </p>
                    <p>
                      <strong className="text-[#0A3A33]">Contact:</strong> {s.sanyojakContact}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingSector(s)}
                    className="p-1.5 rounded-lg text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteSector(s.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DESIGNATIONS TAB */}
      {activeMasterTab === 'designations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0A3A33]">Mission Preacher Designations</h3>
            <button
              onClick={() =>
                setEditingDesignation({
                  name: '',
                  sortOrder: designations.length + 1,
                  active: true,
                })
              }
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('add')} Designation</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                  <th className="py-3 px-4 w-20">Sort</th>
                  <th className="py-3 px-4">Designation Name</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF4F2]">
                {designations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F9FCFB]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0A3A33]">
                      {d.sortOrder}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0A3A33]">{d.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingDesignation(d)}
                          className="p-1 rounded-md text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDesignation(d.id)}
                          className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. HOLDS TAB (FR-PR-4) */}
      {activeMasterTab === 'holds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0A3A33]">
                Pracharak Holds (Unavailability Ranges)
              </h3>
              <p className="text-xs text-[#719B93]">
                Preachers on hold are automatically hidden during duty allocation for matching dates.
              </p>
            </div>
            <button
              onClick={() =>
                setEditingHold({
                  pracharakId: pracharaks[0]?.id || '',
                  fromDate: new Date().toISOString().split('T')[0],
                  toDate: new Date().toISOString().split('T')[0],
                  reason: '',
                })
              }
              className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D4F58C]" />
              <span>{t('add')} Hold</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E2EFEB] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                  <th className="py-3 px-4">Pracharak</th>
                  <th className="py-3 px-4 w-32">From Date</th>
                  <th className="py-3 px-4 w-32">To Date</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBF4F2]">
                {holds.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#719B93]">
                      No active preacher holds. All preachers available.
                    </td>
                  </tr>
                ) : (
                  holds.map((h) => {
                    const pr = pracharaks.find((p) => p.id === h.pracharakId);
                    return (
                      <tr key={h.id} className="hover:bg-[#F9FCFB]">
                        <td className="py-3 px-4 font-bold text-[#0A3A33]">
                          {pr?.name || 'Preacher'} ({pr?.code})
                        </td>
                        <td className="py-3 px-4 font-mono">{h.fromDate}</td>
                        <td className="py-3 px-4 font-mono">{h.toDate}</td>
                        <td className="py-3 px-4 text-[#4A726B]">{h.reason}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteHold(h.id)}
                            className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Pracharak Modal */}
      {editingPracharak && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EFEB]">
            <h3 className="text-base font-bold text-[#0A3A33] mb-4">
              {editingPracharak.id ? 'Edit Pracharak' : 'Add New Pracharak'}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Name *</label>
                  <input
                    type="text"
                    value={editingPracharak.name || ''}
                    onChange={(e) => setEditingPracharak({ ...editingPracharak, name: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Code *</label>
                  <input
                    type="text"
                    value={editingPracharak.code || ''}
                    onChange={(e) => setEditingPracharak({ ...editingPracharak, code: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Category</label>
                  <select
                    value={editingPracharak.category || 'B'}
                    onChange={(e) =>
                      setEditingPracharak({
                        ...editingPracharak,
                        category: e.target.value as PracharakCategory,
                      })
                    }
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Age</label>
                  <input
                    type="number"
                    value={editingPracharak.age || 45}
                    onChange={(e) =>
                      setEditingPracharak({ ...editingPracharak, age: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Phone</label>
                  <input
                    type="text"
                    value={editingPracharak.phone || ''}
                    onChange={(e) => setEditingPracharak({ ...editingPracharak, phone: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Residence Address</label>
                <input
                  type="text"
                  value={editingPracharak.residenceAddress || ''}
                  onChange={(e) =>
                    setEditingPracharak({ ...editingPracharak, residenceAddress: e.target.value })
                  }
                  className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  placeholder="Pune address (Geocoding best-effort)"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPracharak.isGyanPracharak || false}
                    onChange={(e) =>
                      setEditingPracharak({
                        ...editingPracharak,
                        isGyanPracharak: e.target.checked,
                      })
                    }
                    className="rounded text-[#0F4C42]"
                  />
                  <span className="font-semibold text-[#0A3A33]">Gyan Pracharak Flag</span>
                </label>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingPracharak(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  savePracharak(editingPracharak);
                  setEditingPracharak(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A]"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2EFEB]">
            <h3 className="text-base font-bold text-[#0A3A33] mb-4">
              {editingBranch.id ? 'Edit Branch' : 'Add New Branch'}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Branch Name *</label>
                  <input
                    type="text"
                    value={editingBranch.name || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Code *</label>
                  <input
                    type="text"
                    value={editingBranch.code || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Sector</label>
                  <select
                    value={editingBranch.sectorId || sectors[0]?.id}
                    onChange={(e) => setEditingBranch({ ...editingBranch, sectorId: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Status</label>
                  <select
                    value={editingBranch.registrationStatus || 'REGISTERED'}
                    onChange={(e) =>
                      setEditingBranch({
                        ...editingBranch,
                        registrationStatus: e.target.value as any,
                      })
                    }
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  >
                    <option value="REGISTERED">REGISTERED</option>
                    <option value="UNREGISTERED">UNREGISTERED (Prabandhakiya)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Mukhi / Leader Name</label>
                  <input
                    type="text"
                    value={editingBranch.mukhiName || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, mukhiName: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">Contact Phone</label>
                  <input
                    type="text"
                    value={editingBranch.mukhiContact || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, mukhiContact: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Satsang Bhavan / Sthal</label>
                <input
                  type="text"
                  value={editingBranch.satsangBhavan || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, satsangBhavan: e.target.value })}
                  className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingBranch(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  saveBranch(editingBranch);
                  setEditingBranch(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A]"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hold Modal */}
      {editingHold && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2EFEB]">
            <h3 className="text-base font-bold text-[#0A3A33] mb-4">
              Add Pracharak Hold
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Select Pracharak *</label>
                <select
                  value={editingHold.pracharakId || pracharaks[0]?.id}
                  onChange={(e) => setEditingHold({ ...editingHold, pracharakId: e.target.value })}
                  className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                >
                  {pracharaks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">From Date *</label>
                  <input
                    type="date"
                    value={editingHold.fromDate || ''}
                    onChange={(e) => setEditingHold({ ...editingHold, fromDate: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0A3A33] mb-1 block">To Date *</label>
                  <input
                    type="date"
                    value={editingHold.toDate || ''}
                    onChange={(e) => setEditingHold({ ...editingHold, toDate: e.target.value })}
                    className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0A3A33] mb-1 block">Reason *</label>
                <input
                  type="text"
                  value={editingHold.reason || ''}
                  onChange={(e) => setEditingHold({ ...editingHold, reason: e.target.value })}
                  placeholder="e.g. Out of station / Personal engagement"
                  className="w-full p-2 border border-[#D5E8E3] rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E2EFEB] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingHold(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4A726B] hover:bg-[#F0F7F5]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  saveHold(editingHold);
                  setEditingHold(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A]"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

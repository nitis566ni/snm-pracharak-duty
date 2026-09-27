import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  Building,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  Layers,
  Video,
  CornerDownLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Pracharak, Branch, DutyAllocation, Sector } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

type GroundedCategory = 'all' | 'pracharaks' | 'branches' | 'duties' | 'pending' | 'special';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const {
    pracharaks,
    branches,
    sectors,
    dutyAllocations,
    specialDays,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    setActiveTab,
    isZoneAdmin,
  } = useApp();

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<GroundedCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  // Global Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Helper Maps
  const branchMap = useMemo(() => new Map(branches.map((b) => [b.id, b])), [branches]);
  const pracharakMap = useMemo(() => new Map(pracharaks.map((p) => [p.id, p])), [pracharaks]);
  const sectorMap = useMemo(() => new Map(sectors.map((s) => [s.id, s])), [sectors]);

  // Search Grounding Engine across Entire Zone Data
  const groundedResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        pracharaks: [],
        branches: [],
        duties: [],
        pending: [],
        special: [],
        total: 0,
        groundedSummary: null,
      };
    }

    // 1. Ground Pracharaks
    const matchedPracharaks = pracharaks.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchPhone = p.phone.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase() === q || `category ${p.category.toLowerCase()}`.includes(q);
      const matchAddress = p.residenceAddress.toLowerCase().includes(q);
      const homeBranch = p.homeBranchId ? branchMap.get(p.homeBranchId)?.name.toLowerCase() : '';
      const matchBranch = homeBranch?.includes(q);
      return matchName || matchCode || matchPhone || matchCat || matchAddress || matchBranch;
    });

    // 2. Ground Branches
    const matchedBranches = branches.filter((b) => {
      const matchName = b.name.toLowerCase().includes(q);
      const matchCode = b.code.toLowerCase().includes(q);
      const matchBhavan = b.satsangBhavan.toLowerCase().includes(q);
      const matchMukhi = b.mukhiName.toLowerCase().includes(q);
      const matchContact = b.mukhiContact.toLowerCase().includes(q);
      const matchAddress = b.address.toLowerCase().includes(q);
      const sector = sectorMap.get(b.sectorId)?.name.toLowerCase() || '';
      const matchSector = sector.includes(q);
      return matchName || matchCode || matchBhavan || matchMukhi || matchContact || matchAddress || matchSector;
    });

    // 3. Ground Duties & Allocations
    const matchedDuties = dutyAllocations.filter((d) => {
      const branch = branchMap.get(d.branchId);
      const pr = d.pracharakId ? pracharakMap.get(d.pracharakId) : null;
      const matchDate = d.date.includes(q);
      const matchBranch = branch?.name.toLowerCase().includes(q) || branch?.code.toLowerCase().includes(q);
      const matchPreacher = pr?.name.toLowerCase().includes(q) || pr?.code.toLowerCase().includes(q);
      const matchLocal = d.localPracharakName?.toLowerCase().includes(q);
      const matchOther = d.otherZoneDetails?.toLowerCase().includes(q);
      const matchStatus = d.approvalStatus.toLowerCase().includes(q);
      const matchType = d.type.toLowerCase().includes(q);
      const matchVichar = (d.type === 'vichar' || q === 'vichar') && (d.type === 'vichar' || q.includes('vichar'));
      return (
        matchDate ||
        matchBranch ||
        matchPreacher ||
        matchLocal ||
        matchOther ||
        matchStatus ||
        matchType ||
        matchVichar
      );
    });

    // 4. Ground Pending Approvals
    const matchedPending = dutyAllocations.filter((d) => {
      if (d.approvalStatus !== 'PENDING') return false;
      if (q === 'pending' || q.includes('approval') || q.includes('nomination')) return true;
      const branch = branchMap.get(d.branchId);
      const pr = d.pracharakId ? pracharakMap.get(d.pracharakId) : null;
      return (
        d.date.includes(q) ||
        branch?.name.toLowerCase().includes(q) ||
        pr?.name.toLowerCase().includes(q) ||
        d.localPracharakName?.toLowerCase().includes(q) ||
        d.otherZoneDetails?.toLowerCase().includes(q)
      );
    });

    // 5. Ground Special Days
    const matchedSpecial = specialDays.filter((s) => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.startDate.includes(q) ||
        s.endDate.includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });

    // Generate Grounded Knowledge Summary (Direct answer computed from data)
    let groundedSummary: string | null = null;
    if (q === 'pending' || q.includes('approv')) {
      groundedSummary = `Found ${matchedPending.length} duties awaiting Zone Admin approval across ${new Set(matchedPending.map((p) => p.branchId)).size} branches in Zone 34.`;
    } else if (matchedPracharaks.length === 1) {
      const pr = matchedPracharaks[0];
      const prDuties = dutyAllocations.filter((d) => d.pracharakId === pr.id);
      groundedSummary = `${pr.name} (${pr.code}, Category ${pr.category}) has ${prDuties.length} total assigned duties across Zone 34 Bhavans. Phone: ${pr.phone}`;
    } else if (matchedBranches.length === 1) {
      const br = matchedBranches[0];
      const brDuties = dutyAllocations.filter((d) => d.branchId === br.id);
      groundedSummary = `${br.name} (${br.code}) is located at ${br.satsangBhavan}. Branch Mukhi: ${br.mukhiName} (${br.mukhiContact}). Has ${brDuties.length} scheduled duty allocations.`;
    } else if (q.includes('vichar')) {
      const vicharDuties = dutyAllocations.filter((d) => d.type === 'vichar');
      groundedSummary = `${vicharDuties.length} Satguru Mata Sudiksha Ji Maharaj video discourse broadcasts scheduled across Zone 34 Bhavans.`;
    }

    const total =
      matchedPracharaks.length +
      matchedBranches.length +
      matchedDuties.length +
      matchedPending.length +
      matchedSpecial.length;

    return {
      pracharaks: matchedPracharaks,
      branches: matchedBranches,
      duties: matchedDuties,
      pending: matchedPending,
      special: matchedSpecial,
      total,
      groundedSummary,
    };
  }, [query, pracharaks, branches, dutyAllocations, specialDays, branchMap, pracharakMap, sectorMap]);

  // Flatten active items for keyboard navigation
  const flatItems = useMemo(() => {
    const list: Array<{ type: string; item: any }> = [];
    if (selectedCategory === 'all' || selectedCategory === 'pracharaks') {
      groundedResults.pracharaks.forEach((p) => list.push({ type: 'pracharak', item: p }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'branches') {
      groundedResults.branches.forEach((b) => list.push({ type: 'branch', item: b }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'pending') {
      groundedResults.pending.forEach((d) => list.push({ type: 'duty', item: d }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'duties') {
      groundedResults.duties.forEach((d) => list.push({ type: 'duty', item: d }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'special') {
      groundedResults.special.forEach((s) => list.push({ type: 'special', item: s }));
    }
    return list;
  }, [selectedCategory, groundedResults]);

  // Handle item selection / navigation
  const handleSelectItem = (entry: { type: string; item: any }) => {
    onClose();

    if (entry.type === 'pracharak') {
      // Navigate to Calendar or Master
      setActiveTab('calendar');
    } else if (entry.type === 'branch') {
      setActiveTab('calendar');
    } else if (entry.type === 'duty') {
      const dt = new Date(entry.item.date);
      if (!isNaN(dt.getTime())) {
        setSelectedYear(dt.getFullYear());
        setSelectedMonth(dt.getMonth() + 1);
      }
      setActiveTab('calendar');
    } else if (entry.type === 'special') {
      setActiveTab('calendar');
    }
  };

  // Keyboard navigation
  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleSelectItem(flatItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2EFEB] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2EFEB] flex items-center gap-3 bg-[#FAFDFD] shrink-0">
          <Search className="w-5 h-5 text-[#2B8274] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Search by Pracharak name, code (PR-101), Branch (PN-01), duty date or status..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#0A3A33] placeholder-[#719B93] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Filter Category Chips */}
        {query && (
          <div className="px-4 py-2.5 bg-white border-b border-[#E2EFEB] flex flex-wrap items-center gap-1.5 text-xs shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#0F4C42] text-white shadow-2xs'
                  : 'bg-[#F0F7F5] text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              All Grounded ({groundedResults.total})
            </button>
            <button
              onClick={() => setSelectedCategory('pracharaks')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                selectedCategory === 'pracharaks'
                  ? 'bg-[#0F4C42] text-white shadow-2xs'
                  : 'bg-[#F0F7F5] text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Pracharaks ({groundedResults.pracharaks.length})
            </button>
            <button
              onClick={() => setSelectedCategory('branches')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                selectedCategory === 'branches'
                  ? 'bg-[#0F4C42] text-white shadow-2xs'
                  : 'bg-[#F0F7F5] text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Branches ({groundedResults.branches.length})
            </button>
            <button
              onClick={() => setSelectedCategory('duties')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                selectedCategory === 'duties'
                  ? 'bg-[#0F4C42] text-white shadow-2xs'
                  : 'bg-[#F0F7F5] text-[#4A726B] hover:text-[#0A3A33]'
              }`}
            >
              Duty Records ({groundedResults.duties.length})
            </button>
            {groundedResults.pending.length > 0 && (
              <button
                onClick={() => setSelectedCategory('pending')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  selectedCategory === 'pending'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                Pending ({groundedResults.pending.length})
              </button>
            )}
          </div>
        )}

        {/* Grounded AI Knowledge Summary (if match found) */}
        {groundedResults.groundedSummary && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#E8F6F2] border border-[#BCE8DD] flex items-start gap-2.5 text-xs text-[#0F4C42] shrink-0">
            <Sparkles className="w-4 h-4 text-[#2B8274] shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#2B8274] block">
                Search Grounding Insight
              </span>
              <p className="font-medium mt-0.5 leading-relaxed">{groundedResults.groundedSummary}</p>
            </div>
          </div>
        )}

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query ? (
            /* Empty State: Quick Suggestions */
            <div className="py-6 px-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F6F2] text-[#0F4C42] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-[#2B8274]" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#0A3A33]">
                  Zone 34 Global Grounded Search
                </h4>
                <p className="text-xs text-[#719B93] mt-1 max-w-sm mx-auto">
                  Instantly find any Preacher, Bhavan, Satsang duty record, or pending approval by typing a name, code, or date.
                </p>
              </div>

              {/* Quick Search Suggestions */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#719B93] block mb-2">
                  Suggested Quick Searches:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'Pending',
                    'Rev. Harbhajan Singh',
                    'PR-101',
                    'Pune Camp',
                    'PN-01',
                    'Satguru Vichar',
                    'Pimpri',
                    'Category A+',
                  ].map((sugg) => (
                    <button
                      key={sugg}
                      onClick={() => setQuery(sugg)}
                      className="px-3 py-1.5 rounded-xl bg-[#F0F7F5] hover:bg-[#E3F8AC] hover:text-[#0A3A33] border border-[#D5E8E3] text-xs font-semibold text-[#4A726B] transition-all"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : groundedResults.total === 0 ? (
            /* No Results Found */
            <div className="py-12 text-center text-xs text-[#719B93] space-y-2">
              <p className="font-bold text-sm text-[#0A3A33]">No grounded records matching "{query}"</p>
              <p>Check the preacher code (e.g. PR-101), branch code (PN-01), or clear filters.</p>
            </div>
          ) : (
            /* Render Categorized Grounded Results */
            <div className="space-y-4">
              {/* Section: Pracharaks */}
              {(selectedCategory === 'all' || selectedCategory === 'pracharaks') &&
                groundedResults.pracharaks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#719B93] uppercase tracking-wider mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#2B8274]" />
                        <span>Pracharaks ({groundedResults.pracharaks.length})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {groundedResults.pracharaks.map((p) => {
                        const homeBranch = p.homeBranchId ? branchMap.get(p.homeBranchId) : null;
                        const dutyCount = dutyAllocations.filter((d) => d.pracharakId === p.id).length;

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleSelectItem({ type: 'pracharak', item: p })}
                            className="p-3 bg-[#FAFDFD] hover:bg-white rounded-2xl border border-[#E2EFEB] hover:border-[#2B8274] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#E3F8AC] text-[#0A3A33] font-extrabold flex items-center justify-center text-xs shrink-0">
                                {p.category}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-extrabold text-xs text-[#0A3A33] truncate">
                                    {p.name}
                                  </h5>
                                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-bold text-slate-700">
                                    {p.code}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#4A726B] truncate mt-0.5 flex items-center gap-2">
                                  <span>{homeBranch ? homeBranch.name : 'Pune Zone'}</span>
                                  <span>·</span>
                                  <span>{p.phone}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono font-bold bg-[#F0F7F5] text-[#0F4C42] px-2 py-0.5 rounded-lg">
                                {dutyCount} duties
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Section: Branches */}
              {(selectedCategory === 'all' || selectedCategory === 'branches') &&
                groundedResults.branches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#719B93] uppercase tracking-wider mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#2B8274]" />
                        <span>Branches & Bhavans ({groundedResults.branches.length})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {groundedResults.branches.map((b) => {
                        const sector = sectorMap.get(b.sectorId);
                        return (
                          <div
                            key={b.id}
                            onClick={() => handleSelectItem({ type: 'branch', item: b })}
                            className="p-3 bg-[#FAFDFD] hover:bg-white rounded-2xl border border-[#E2EFEB] hover:border-[#2B8274] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-[#0F4C42] text-white flex items-center justify-center text-xs font-bold shrink-0">
                                {b.code}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-xs text-[#0A3A33] truncate">
                                  {b.name}
                                </h5>
                                <p className="text-[11px] text-[#4A726B] truncate mt-0.5">
                                  {b.satsangBhavan} · Mukhi: {b.mukhiName} ({b.mukhiContact})
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold bg-[#E8F6F2] text-[#0F4C42] px-2 py-0.5 rounded-lg">
                                {sector ? sector.name : 'Zone 34'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Section: Duty Records */}
              {(selectedCategory === 'all' || selectedCategory === 'duties' || selectedCategory === 'pending') &&
                (selectedCategory === 'pending'
                  ? groundedResults.pending
                  : groundedResults.duties
                ).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-[#719B93] uppercase tracking-wider mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#2B8274]" />
                        <span>Duty Allocations ({
                          (selectedCategory === 'pending'
                            ? groundedResults.pending
                            : groundedResults.duties
                          ).length
                        })</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(selectedCategory === 'pending'
                        ? groundedResults.pending
                        : groundedResults.duties
                      )
                        .slice(0, 15)
                        .map((d) => {
                          const branch = branchMap.get(d.branchId);
                          const pr = d.pracharakId ? pracharakMap.get(d.pracharakId) : null;

                          return (
                            <div
                              key={d.id}
                              onClick={() => handleSelectItem({ type: 'duty', item: d })}
                              className="p-3 bg-[#FAFDFD] hover:bg-white rounded-2xl border border-[#E2EFEB] hover:border-[#2B8274] transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-12 h-10 rounded-xl bg-[#F0F7F5] border border-[#D5E8E3] flex flex-col items-center justify-center shrink-0">
                                  <span className="text-[9px] uppercase font-bold text-[#719B93]">
                                    {new Date(d.date).toLocaleDateString('en-US', { month: 'short' })}
                                  </span>
                                  <span className="text-xs font-extrabold font-mono text-[#0A3A33] leading-none">
                                    {d.date.split('-')[2]}
                                  </span>
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xs text-[#0A3A33] truncate">
                                      {d.type === 'vichar'
                                        ? 'Satguru Mata Ji Vichar Video'
                                        : d.type === 'local'
                                        ? `Local: ${d.localPracharakName}`
                                        : d.type === 'other_zone'
                                        ? `Other Zone: ${d.otherZoneDetails}`
                                        : pr?.name || 'Unassigned'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#4A726B] truncate mt-0.5">
                                    {branch?.name} ({branch?.code}) · {d.date}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                    d.approvalStatus === 'APPROVED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {d.approvalStatus}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Modal Bottom Keyboard Shortcuts Bar */}
        <div className="p-3 bg-[#F9FCFB] border-t border-[#E2EFEB] px-4 flex items-center justify-between text-[11px] text-[#719B93] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↵
              </kbd>
              <span>to jump</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ESC
              </kbd>
              <span>to close</span>
            </span>
          </div>

          <span className="font-medium text-[#4A726B]">
            Zone 34 Grounded Intelligence
          </span>
        </div>
      </div>
    </div>
  );
};

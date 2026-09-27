import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublishView: React.FC = () => {
  const {
    dutyFreezes,
    toggleMonthFreeze,
    isZoneAdmin,
    t,
  } = useApp();

  const [activeYear, setActiveYear] = useState<number>(2026);

  const months = [
    { number: 1, name: 'January' },
    { number: 2, name: 'February' },
    { number: 3, name: 'March' },
    { number: 4, name: 'April' },
    { number: 5, name: 'May' },
    { number: 6, name: 'June' },
    { number: 7, name: 'July' },
    { number: 8, name: 'August' },
    { number: 9, name: 'September' },
    { number: 10, name: 'October' },
    { number: 11, name: 'November' },
    { number: 12, name: 'December' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            Publish / Freeze duties — {activeYear}
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Freeze a month to publish its final chart. Mukhis then see it read-only; unfreeze to make changes.
          </p>
        </div>

        {/* Year Switcher Pills (Matching screenshot 10: 2025, 2026, 2027) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#D5E8E3] shadow-2xs">
          {[2025, 2026, 2027].map((yr) => (
            <button
              key={yr}
              onClick={() => setActiveYear(yr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeYear === yr
                  ? 'bg-[#0F4C42] text-white shadow-2xs'
                  : 'text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* 12-Month Matrix (Direct representation of screenshot 10) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((m) => {
            const freezeRecord = dutyFreezes.find(
              (f) => f.year === activeYear && f.month === m.number && f.isFrozen
            );
            const isPublished = !!freezeRecord;

            return (
              <div
                key={m.number}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isPublished
                    ? 'bg-[#F4FAF8] border-[#CDEAE2]'
                    : 'bg-white border-[#E2EFEB] hover:border-[#2B8274]/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-[#0A3A33]">
                    {m.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPublished
                        ? 'bg-[#0F4C42] text-white'
                        : 'bg-[#F0F7F5] text-[#719B93]'
                    }`}
                  >
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {isZoneAdmin ? (
                  <button
                    onClick={() => toggleMonthFreeze(activeYear, m.number)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isPublished
                        ? 'bg-white hover:bg-slate-100 text-[#0F4C42] border border-[#CDEAE2] shadow-2xs'
                        : 'bg-[#0F4C42] hover:bg-[#155A4F] text-white shadow-2xs'
                    }`}
                  >
                    {isPublished ? (
                      <>
                        <Unlock className="w-3 h-3 text-[#2B8274]" />
                        <span>Unfreeze</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-[#D4F58C]" />
                        <span>Freeze</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    {isPublished ? 'Read-Only' : 'Open'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

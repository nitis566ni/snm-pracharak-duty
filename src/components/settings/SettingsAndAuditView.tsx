import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Clock,
  Video,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Layers,
  History,
  FileText,
  Image,
  Palette,
  Type,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppSettings, SpecialDay, PracharakCategory, ReportSettings, ReportLineConfig, ThemeName, FontSizeName } from '../../types';
import { THEME_CONFIGS, FONT_SIZES } from '../../utils/themeConfig';

export const SettingsAndAuditView: React.FC = () => {
  const {
    appSettings,
    saveAppSettings,
    reportSettings,
    saveReportSettings,
    specialDays,
    saveSpecialDay,
    deleteSpecialDay,
    isZoneAdmin,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'appearance' | 'rules' | 'report_header' | 'special_days'>('appearance');

  const [rules, setRules] = useState<AppSettings>({ ...appSettings });
  const [repSettings, setRepSettings] = useState<ReportSettings>({ ...reportSettings });
  const [newSpecialDay, setNewSpecialDay] = useState<Partial<SpecialDay>>({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    description: '',
    active: true,
  });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSaveAll = () => {
    saveAppSettings(rules);
    saveReportSettings(repSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const toggleMukhiWeek = (week: number) => {
    setRules((prev) => {
      const exists = prev.mukhiFillableWeeks.includes(week);
      return {
        ...prev,
        mukhiFillableWeeks: exists
          ? prev.mukhiFillableWeeks.filter((w) => w !== week)
          : [...prev.mukhiFillableWeeks, week].sort(),
      };
    });
  };

  const toggleVicharWeek = (week: number) => {
    setRules((prev) => {
      const exists = prev.vicharWeeks.includes(week);
      return {
        ...prev,
        vicharWeeks: exists
          ? prev.vicharWeeks.filter((w) => w !== week)
          : [...prev.vicharWeeks, week].sort(),
      };
    });
  };

  const updateCategoryLimit = (
    cat: PracharakCategory,
    field: 'minDuties' | 'maxDuties',
    val: number
  ) => {
    setRules((prev) => ({
      ...prev,
      categoryLimits: prev.categoryLimits.map((c) =>
        c.category === cat ? { ...c, [field]: val } : c
      ),
    }));
  };

  const updateLineConfig = (
    lineKey: 'line1' | 'line2' | 'line3' | 'line4',
    field: keyof ReportLineConfig,
    value: any
  ) => {
    setRepSettings((prev) => ({
      ...prev,
      [lineKey]: {
        ...prev[lineKey],
        [field]: value,
      },
    }));
  };

  const handleAddSpecialDay = () => {
    if (!newSpecialDay.name) return;
    saveSpecialDay(newSpecialDay);
    setNewSpecialDay({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
      active: true,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0A3A33] tracking-tight">
            Settings & Configurations
          </h2>
          <p className="text-xs text-[#4A726B] mt-0.5">
            Zone-wide rules, report header customization & special days
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#D5E8E3] shadow-2xs overflow-x-auto">
          {[
            { id: 'appearance', label: 'Theme & Font Size', icon: Palette },
            { id: 'rules', label: 'Rules & Settings', icon: Sliders },
            { id: 'report_header', label: 'Report Header', icon: FileText },
            { id: 'special_days', label: 'Special Days', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0F4C42] text-white shadow-2xs'
                    : 'text-[#4A726B] hover:text-[#0A3A33] hover:bg-[#F0F7F5]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Configuration saved successfully and updated zone-wide!</span>
        </div>
      )}

      {/* 0. THEME & FONT SIZE TAB */}
      {activeSubTab === 'appearance' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs space-y-8">
          <div>
            <h3 className="text-base font-bold text-[#0A3A33]">
              Visual Theme & Accessibility Appearance
            </h3>
            <p className="text-xs text-[#719B93] mt-0.5">
              Customize the interface color scheme and overall font sizing for optimal readability across desktop and mobile.
            </p>
          </div>

          {/* Theme Palette Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0A3A33] uppercase tracking-wider">
              Select Color Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(THEME_CONFIGS) as ThemeName[]).map((thmKey) => {
                const cfg = THEME_CONFIGS[thmKey];
                const isSelected = theme === thmKey;

                return (
                  <div
                    key={thmKey}
                    onClick={() => setTheme(thmKey)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#0F4C42] bg-[#F2FAF7] shadow-sm'
                        : 'border-[#E2EFEB] hover:border-[#D5E8E3] bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-xs text-[#0A3A33]">
                          {cfg.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F4C42] text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#719B93] font-devanagari">
                        {cfg.nameHi}
                      </p>
                    </div>

                    {/* Color Swatch Preview Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: cfg.dotColor }}
                          title="Primary Brand Accent"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{
                            backgroundColor:
                              thmKey === 'forest'
                                ? '#059669'
                                : thmKey === 'amber'
                                ? '#FDE68A'
                                : thmKey === 'purple'
                                ? '#DDD6FE'
                                : thmKey === 'ocean'
                                ? '#BAE6FD'
                                : '#E3F8AC',
                          }}
                          title="Secondary Badge Accent"
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs"
                          style={{
                            backgroundColor:
                              thmKey === 'forest' ? '#0A1614' : thmKey === 'amber' ? '#FFFDF5' : thmKey === 'purple' ? '#FAF7FD' : thmKey === 'ocean' ? '#F0F5FA' : '#EFF8F6',
                          }}
                          title="Canvas Background"
                        />
                      </div>
                      <span className="text-[10px] text-[#2B8274] font-semibold">
                        {isSelected ? 'Selected' : 'Click to apply'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Font Size Scaler */}
          <div className="space-y-4 pt-4 border-t border-[#E2EFEB]">
            <div>
              <label className="block text-xs font-bold text-[#0A3A33] uppercase tracking-wider">
                Overall Font Size & Scale
              </label>
              <p className="text-xs text-[#719B93] mt-0.5">
                Increases or decreases base typography scale across all tables, calendars, and text throughout the application.
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {FONT_SIZES.map((f) => {
                const isSelected = fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFontSize(f.id)}
                    className={`py-3 px-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-[#0F4C42] text-white border-[#0F4C42] shadow-sm font-bold'
                        : 'bg-[#F9FCFB] hover:bg-white text-[#0A3A33] border-[#D5E8E3] font-medium'
                    }`}
                  >
                    <div className="text-lg font-bold">{f.scale}</div>
                    <div className="text-[11px] mt-0.5">{f.label}</div>
                    <div className="text-[9px] opacity-75 font-mono">{f.px}</div>
                  </button>
                );
              })}
            </div>

            {/* Live Typography Preview Box */}
            <div className="p-4 bg-[#F0F7F5] rounded-2xl border border-[#D5E8E3] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#719B93]">
                Live Font Scale Preview
              </span>
              <p className="text-sm font-bold text-[#0A3A33]">
                Sant Nirankari Mission · Zone 34, Pune · Pracharak Duty Management System
              </p>
              <p className="text-xs text-[#4A726B] font-devanagari">
                संत निरंकारी मिशन · झोन ३४, पुणे · प्रचारक सेवा वाटप व सत्संग व्यवस्थापन प्रणाली (धन निरंकार जी)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1. RULES & SETTINGS (Screenshot 13) */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0A3A33]">
              Rules & Settings
            </h3>
            <p className="text-xs text-[#719B93]">
              Zone-wide rules: which weeks Mukhis may fill, Vichar weeks, per-category duty limits, and approvals.
            </p>
          </div>

          {/* Mukhi-fillable weeks (global) */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#0A3A33] block">
              Mukhi-fillable weeks (global)
            </label>
            <p className="text-xs text-[#719B93]">
              Weeks of the month a Branch Mukhi may allocate Pracharak duty for their Satsangs. Applies to all branches.
            </p>
            <div className="flex gap-4 pt-1 text-xs font-semibold text-[#0A3A33]">
              {[1, 2, 3, 4, 5].map((wk) => (
                <label key={wk} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isZoneAdmin}
                    checked={rules.mukhiFillableWeeks.includes(wk)}
                    onChange={() => toggleMukhiWeek(wk)}
                    className="w-4 h-4 text-[#0F4C42] rounded focus:ring-0"
                  />
                  <span>Week {wk}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vichar weeks (global) */}
          <div className="space-y-2 pt-2 border-t border-[#E2EFEB]">
            <label className="font-bold text-xs text-[#0A3A33] block">
              Vichar weeks — Her Holiness Satguru Mata Ji Vichar (global)
            </label>
            <p className="text-xs text-[#719B93]">
              Weeks of the month that are the video 'Vichar' day. No Pracharak duty is allocated on these weeks.
            </p>
            <div className="flex gap-4 pt-1 text-xs font-semibold text-[#0A3A33]">
              {[1, 2, 3, 4, 5].map((wk) => (
                <label key={wk} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isZoneAdmin}
                    checked={rules.vicharWeeks.includes(wk)}
                    onChange={() => toggleVicharWeek(wk)}
                    className="w-4 h-4 text-[#0F4C42] rounded focus:ring-0"
                  />
                  <span>Week {wk}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Min / Max duties per month by Category */}
          <div className="space-y-3 pt-2 border-t border-[#E2EFEB]">
            <label className="font-bold text-xs text-[#0A3A33] block">
              Min / Max duties per month by Category
            </label>
            <div className="max-w-xl space-y-2 text-xs">
              <div className="grid grid-cols-3 font-bold text-[#719B93] pb-1">
                <span>Category</span>
                <span>Min</span>
                <span>Max</span>
              </div>
              {rules.categoryLimits.map((lim) => (
                <div key={lim.category} className="grid grid-cols-3 items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#0A3A33]">
                    {lim.category}
                  </span>
                  <input
                    type="number"
                    disabled={!isZoneAdmin}
                    value={lim.minDuties}
                    onChange={(e) => updateCategoryLimit(lim.category, 'minDuties', Number(e.target.value))}
                    className="w-24 p-2 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl font-mono text-xs focus:outline-none"
                  />
                  <input
                    type="number"
                    disabled={!isZoneAdmin}
                    value={lim.maxDuties}
                    onChange={(e) => updateCategoryLimit(lim.category, 'maxDuties', Number(e.target.value))}
                    className="w-24 p-2 bg-[#FAFDFB] border border-[#D5E8E3] rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Approvals */}
          <div className="space-y-2 pt-2 border-t border-[#E2EFEB] text-xs">
            <label className="font-bold text-xs text-[#0A3A33] block mb-2">
              Approvals
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#0A3A33]">
                <input
                  type="checkbox"
                  disabled={!isZoneAdmin}
                  checked={rules.requireLocalApproval}
                  onChange={(e) => setRules({ ...rules, requireLocalApproval: e.target.checked })}
                  className="w-4 h-4 text-[#0F4C42] rounded focus:ring-0"
                />
                <span>Require Zone approval for Local Pracharak duties</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#0A3A33]">
                <input
                  type="checkbox"
                  disabled={!isZoneAdmin}
                  checked={rules.requireOtherZoneApproval}
                  onChange={(e) => setRules({ ...rules, requireOtherZoneApproval: e.target.checked })}
                  className="w-4 h-4 text-[#0F4C42] rounded focus:ring-0"
                />
                <span>Require Zone approval for Other Zone Pracharak duties</span>
              </label>
            </div>
          </div>

          {isZoneAdmin && (
            <div className="pt-4 border-t border-[#E2EFEB] flex justify-end">
              <button
                onClick={handleSaveAll}
                className="px-6 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A] flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-[#D4F58C]" />
                <span>Save Rules</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. REPORT HEADER CONFIGURATION (Screenshot 14) */}
      {activeSubTab === 'report_header' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0A3A33]">
              Report Header
            </h3>
            <p className="text-xs text-[#719B93]">
              Title rows, logo and contact line printed at the top of the Pracharak and Satsang duty charts.
            </p>
          </div>

          {/* Title Rows (printed at the top of every chart) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#0A3A33]">
              Title rows (printed at the top of every chart)
            </h4>

            {[
              { key: 'line1', label: 'Line 1', config: repSettings.line1 },
              { key: 'line2', label: 'Line 2', config: repSettings.line2 },
              { key: 'line3', label: 'Line 3', config: repSettings.line3 },
              { key: 'line4', label: 'Line 4', config: repSettings.line4 },
            ].map(({ key, label, config }) => (
              <div key={key} className="space-y-1 bg-[#FAFDFB] p-3.5 rounded-2xl border border-[#E2EFEB]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs">
                  <div className="flex-1">
                    <span className="block text-[11px] font-bold text-[#4A726B] mb-1">{label}</span>
                    <input
                      type="text"
                      disabled={!isZoneAdmin}
                      value={config.text}
                      onChange={(e) => updateLineConfig(key as any, 'text', e.target.value)}
                      placeholder="Title line text"
                      className="w-full p-2 bg-white border border-[#D5E8E3] rounded-xl text-xs font-medium text-[#0A3A33]"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div>
                      <span className="block text-[10px] text-[#719B93] mb-1">Size</span>
                      <input
                        type="number"
                        disabled={!isZoneAdmin}
                        value={config.size}
                        onChange={(e) => updateLineConfig(key as any, 'size', Number(e.target.value))}
                        className="w-14 p-2 bg-white border border-[#D5E8E3] rounded-xl text-xs font-mono text-center"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#719B93] mb-1">Colour</span>
                      <input
                        type="color"
                        disabled={!isZoneAdmin}
                        value={config.color}
                        onChange={(e) => updateLineConfig(key as any, 'color', e.target.value)}
                        className="w-9 h-9 p-0.5 rounded-lg border border-[#D5E8E3] cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] text-[#719B93] mb-1">Align</span>
                      <select
                        disabled={!isZoneAdmin}
                        value={config.align}
                        onChange={(e) => updateLineConfig(key as any, 'align', e.target.value as any)}
                        className="p-2 bg-white border border-[#D5E8E3] rounded-xl text-xs"
                      >
                        <option value="Center">Center</option>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isZoneAdmin}
                          checked={config.bold}
                          onChange={(e) => updateLineConfig(key as any, 'bold', e.target.checked)}
                          className="rounded text-[#0F4C42]"
                        />
                        <span className="text-[11px] font-bold">Bold</span>
                      </label>

                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={!isZoneAdmin}
                          checked={config.italic}
                          onChange={(e) => updateLineConfig(key as any, 'italic', e.target.checked)}
                          className="rounded text-[#0F4C42]"
                        />
                        <span className="text-[11px] italic">Italic</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact line */}
          <div className="space-y-1 pt-2 border-t border-[#E2EFEB] text-xs">
            <label className="font-bold text-[#0A3A33] block">
              Contact line (footer under the header)
            </label>
            <input
              type="text"
              disabled={!isZoneAdmin}
              value={repSettings.contactLine}
              onChange={(e) => setRepSettings({ ...repSettings, contactLine: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#D5E8E3] rounded-xl text-xs font-medium text-[#0A3A33]"
            />
          </div>

          {/* Logo image preview */}
          <div className="space-y-2 pt-2 border-t border-[#E2EFEB] text-xs">
            <label className="font-bold text-[#0A3A33] block">
              Logo image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF7F4] border-2 border-[#0F4C42] flex items-center justify-center text-[#0F4C42]">
                <svg className="w-10 h-10 text-[#0F4C42]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-[#0A3A33]">
                <input
                  type="checkbox"
                  disabled={!isZoneAdmin}
                  checked={!repSettings.showLogo}
                  onChange={(e) => setRepSettings({ ...repSettings, showLogo: !e.target.checked })}
                  className="rounded text-[#0F4C42]"
                />
                <span>Remove current logo</span>
              </label>
            </div>
          </div>

          {isZoneAdmin && (
            <div className="pt-4 border-t border-[#E2EFEB] flex justify-end">
              <button
                onClick={handleSaveAll}
                className="px-6 py-2.5 rounded-full bg-[#0F3B38] text-white text-xs font-bold shadow-md hover:bg-[#154E4A] flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5 text-[#D4F58C]" />
                <span>Save Report Header</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. SPECIAL DAYS (Screenshot 6) */}
      {activeSubTab === 'special_days' && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#E2EFEB] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EFEB]">
            <div>
              <h3 className="text-base font-bold text-[#0A3A33]">
                Special Days
              </h3>
              <p className="text-xs text-[#719B93]">
                Zone-wide days on which all Satsang duties are skipped (rule 10).
              </p>
            </div>
          </div>

          {/* Table matching screenshot 6 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F5FAF8] border-b border-[#E2EFEB] text-[#4A726B] font-bold">
                  <th className="py-3 px-4 w-48">Date</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 w-28 text-center">Status</th>
                  {isZoneAdmin && <th className="py-3 px-4 w-20 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2EFEB]">
                {specialDays.map((sp) => (
                  <tr key={sp.id} className="hover:bg-[#F9FCFB]">
                    <td className="py-3 px-4 font-mono font-medium text-[#0A3A33]">
                      {sp.startDate === sp.endDate
                        ? sp.startDate
                        : `${sp.startDate} → ${sp.endDate}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0A3A33]">
                      {sp.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          sp.active
                            ? 'bg-[#0F4C42] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sp.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isZoneAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteSpecialDay(sp.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Special Day Form */}
          {isZoneAdmin && (
            <div className="pt-4 border-t border-[#E2EFEB] grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <input
                type="text"
                value={newSpecialDay.name || ''}
                onChange={(e) => setNewSpecialDay({ ...newSpecialDay, name: e.target.value })}
                placeholder="Name (e.g. Guru Pooja Diwas)"
                className="p-2.5 border border-[#D5E8E3] rounded-xl text-xs sm:col-span-2"
              />
              <input
                type="date"
                value={newSpecialDay.startDate || ''}
                onChange={(e) => setNewSpecialDay({ ...newSpecialDay, startDate: e.target.value, endDate: e.target.value })}
                className="p-2.5 border border-[#D5E8E3] rounded-xl text-xs font-mono"
              />
              <button
                onClick={handleAddSpecialDay}
                className="px-4 py-2 bg-[#0F4C42] hover:bg-[#155A4F] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Special Day</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

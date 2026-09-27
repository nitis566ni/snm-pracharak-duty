import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Calendar,
  Lock,
  Unlock,
  Shield,
  Building2,
  ChevronDown,
  Palette,
  Type,
  UserCheck,
  Command,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language, ThemeName, FontSizeName } from '../../types';
import { THEME_CONFIGS, FONT_SIZES } from '../../utils/themeConfig';
import { GlobalSearchModal } from '../search/GlobalSearchModal';

export const TopHeader: React.FC = () => {
  const {
    t,
    lang,
    setLang,
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    isMonthFrozen,
    currentUser,
    setCurrentUser,
    users,
    isZoneAdmin,
    userBranch,
    theme,
    setTheme,
    fontSize,
    setFontSize,
  } = useApp();

  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const months = [
    { value: 8, name: 'August 2026' },
    { value: 9, name: 'September 2026' },
    { value: 10, name: 'October 2026' },
    { value: 11, name: 'November 2026' },
    { value: 12, name: 'December 2026' },
  ];

  const currentTheme = THEME_CONFIGS[theme] || THEME_CONFIGS.mint;

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-transparent flex items-center justify-between gap-3 border-b border-[#E2EFEB] shrink-0 relative z-30">
      {/* Left: App Title and Subtext */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A3A33]">
              Sant Nirankari Mission
            </h1>
            <span className="text-xs font-semibold text-[#0F4C42] bg-[#E3F8AC] px-2 py-0.5 rounded-md">
              Zone 34, Pune
            </span>
          </div>
          <p className="text-xs text-[#4A726B] hidden sm:block">
            {t('appSubtitle')} · <span className="italic font-medium">Dhan Nirankar Ji</span>
          </p>
        </div>
      </div>

      {/* Middle: Pill Search Input with Global Grounding */}
      <div className="flex-1 max-w-md mx-2 hidden md:block">
        <div
          onClick={() => setIsGlobalSearchOpen(true)}
          className="relative cursor-pointer group"
        >
          <Search className="w-4 h-4 text-[#4A726B] group-hover:text-[#2B8274] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
          <input
            type="text"
            readOnly
            value={searchQuery}
            onClick={() => setIsGlobalSearchOpen(true)}
            onFocus={() => setIsGlobalSearchOpen(true)}
            placeholder="Global Search (Pracharaks, branches, duties...)"
            className="w-full pl-9 pr-14 py-2 bg-white/80 hover:bg-white focus:bg-white text-xs text-[#0F3B38] placeholder-[#719B93] rounded-full border border-[#D5E8E3] hover:border-[#2B8274] focus:outline-none focus:ring-2 focus:ring-[#2B8274]/30 transition-all shadow-2xs cursor-pointer"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#719B93] bg-[#F0F7F5] rounded border border-[#D5E8E3]">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Quick Controls (Theme, Font Size, Month, Lang, Role) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Mobile Search Trigger Button */}
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="md:hidden p-2 rounded-xl bg-white border border-[#D5E8E3] text-[#0A3A33] hover:border-[#2B8274]"
          title="Search zone data"
        >
          <Search className="w-4 h-4 text-[#2B8274]" />
        </button>
        {/* Quick Theme Switcher Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsThemeMenuOpen(!isThemeMenuOpen);
              setIsFontMenuOpen(false);
            }}
            title="Change Visual Theme"
            className="flex items-center gap-1.5 bg-white border border-[#D5E8E3] hover:border-[#2B8274] rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-[#0F3B38] transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: currentTheme.dotColor }}
            />
            <span className="hidden xl:inline text-xs font-semibold">{currentTheme.name.split(' ')[0]}</span>
            <ChevronDown className="w-3 h-3 text-[#719B93]" />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E2EFEB] p-2 space-y-1 z-50 animate-scaleUp">
              <div className="px-2 py-1 text-[10px] font-bold text-[#719B93] uppercase tracking-wider">
                Select Theme Style
              </div>
              {(Object.keys(THEME_CONFIGS) as ThemeName[]).map((thmKey) => {
                const cfg = THEME_CONFIGS[thmKey];
                const isSelected = theme === thmKey;
                return (
                  <button
                    key={thmKey}
                    onClick={() => {
                      setTheme(thmKey);
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#F0F7F5] font-bold text-[#0F4C42]'
                        : 'hover:bg-slate-50 text-[#0A3A33]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: cfg.dotColor }}
                      />
                      <span>{cfg.name}</span>
                    </div>
                    {isSelected && <span className="text-[#2B8274] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Font Size Scaler */}
        <div className="relative">
          <button
            onClick={() => {
              setIsFontMenuOpen(!isFontMenuOpen);
              setIsThemeMenuOpen(false);
            }}
            title="Adjust Overall Font Size"
            className="flex items-center gap-1 bg-white border border-[#D5E8E3] hover:border-[#2B8274] rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-bold text-[#0F3B38] transition-colors"
          >
            <Type className="w-3.5 h-3.5 text-[#2B8274]" />
            <span className="text-xs">
              {FONT_SIZES.find((f) => f.id === fontSize)?.scale || 'A'}
            </span>
          </button>

          {isFontMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2EFEB] p-2 space-y-1 z-50 animate-scaleUp">
              <div className="px-2 py-1 text-[10px] font-bold text-[#719B93] uppercase tracking-wider">
                Overall Font Size
              </div>
              {FONT_SIZES.map((f) => {
                const isSelected = fontSize === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFontSize(f.id);
                      setIsFontMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#F0F7F5] font-bold text-[#0F4C42]'
                        : 'hover:bg-slate-50 text-[#0A3A33]'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="font-mono text-[10px] text-[#719B93]">{f.scale}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-white border border-[#D5E8E3] rounded-xl px-2.5 py-1 shadow-2xs text-xs font-medium text-[#0F3B38]">
          <Calendar className="w-3.5 h-3.5 text-[#2B8274]" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent focus:outline-none text-xs font-semibold text-[#0A3A33] cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name}
              </option>
            ))}
          </select>
          {isMonthFrozen ? (
            <span title="Month is Frozen & Published (Read-Only)">
              <Lock className="w-3 h-3 text-amber-600 ml-1" />
            </span>
          ) : (
            <span title="Month is Open for Scheduling">
              <Unlock className="w-3 h-3 text-emerald-600 ml-1" />
            </span>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white border border-[#D5E8E3] rounded-xl px-2 py-1 shadow-2xs text-xs font-medium text-[#0F3B38]">
          <Globe className="w-3.5 h-3.5 text-[#2B8274]" />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
        </div>

        {/* Role Switcher Pill */}
        <select
          value={currentUser.id}
          onChange={(e) => {
            const chosen = users.find((u) => u.id === e.target.value);
            if (chosen) setCurrentUser(chosen);
          }}
          className={`hidden sm:flex text-xs font-bold rounded-xl px-2.5 py-1.5 border cursor-pointer focus:outline-none transition-colors ${
            isZoneAdmin
              ? 'bg-[#0F4C42] text-white border-[#0F4C42]'
              : 'bg-[#D4F58C] text-[#0A3A33] border-[#BCE870]'
          }`}
          title="Switch Role / User"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id} className="text-[#0A3A33] bg-white font-normal">
              {u.role === 'ZONE_ADMIN' ? '👑 Admin' : '🏛️ Mukhi'}: {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Global Search Grounding Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        initialQuery={searchQuery}
      />
    </header>
  );
};


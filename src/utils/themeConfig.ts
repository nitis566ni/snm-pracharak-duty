import { ThemeName, FontSizeName } from '../types';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  nameHi: string;
  nameMr: string;
  dotColor: string;
  bgMain: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  rightPanelBg: string;
  borderSubtle: string;
}

export const THEME_CONFIGS: Record<ThemeName, ThemeConfig> = {
  mint: {
    id: 'mint',
    name: 'Serene Jade & Mint',
    nameHi: 'शांत जेड और मिंट (डिफ़ॉल्ट)',
    nameMr: 'शांत जेड आणि मिंट (डीफॉल्ट)',
    dotColor: '#2B8274',
    bgMain: 'bg-[#EFF8F6]',
    bgCard: 'bg-white',
    textPrimary: 'text-[#0F3B38]',
    textSecondary: 'text-[#4A726B]',
    accent: 'bg-[#0F4C42]',
    accentBg: 'bg-[#E3F8AC]',
    accentText: 'text-[#0A3A33]',
    accentBorder: 'border-[#2B8274]',
    rightPanelBg: 'bg-[#0F3B38]',
    borderSubtle: 'border-[#E2EFEB]',
  },
  ocean: {
    id: 'ocean',
    name: 'Sky & Ocean Blue',
    nameHi: 'आसमानी और समुद्री नीला',
    nameMr: 'आकाशी आणि सागरी निळा',
    dotColor: '#0284C7',
    bgMain: 'bg-[#F0F5FA]',
    bgCard: 'bg-white',
    textPrimary: 'text-[#0E2A47]',
    textSecondary: 'text-[#3B6282]',
    accent: 'bg-[#0284C7]',
    accentBg: 'bg-[#BAE6FD]',
    accentText: 'text-[#0369A1]',
    accentBorder: 'border-[#0284C7]',
    rightPanelBg: 'bg-[#0B2138]',
    borderSubtle: 'border-[#E0EBF5]',
  },
  amber: {
    id: 'amber',
    name: 'Saffron & Warm Sandalwood',
    nameHi: 'केसरिया और चंदन (आध्यात्मिक)',
    nameMr: 'भगवा आणि चंदन (अध्यात्मिक)',
    dotColor: '#D97706',
    bgMain: 'bg-[#FFFDF5]',
    bgCard: 'bg-white',
    textPrimary: 'text-[#451A03]',
    textSecondary: 'text-[#78350F]',
    accent: 'bg-[#B45309]',
    accentBg: 'bg-[#FDE68A]',
    accentText: 'text-[#78350F]',
    accentBorder: 'border-[#D97706]',
    rightPanelBg: 'bg-[#3D1A04]',
    borderSubtle: 'border-[#FDEEBA]',
  },
  purple: {
    id: 'purple',
    name: 'Royal Amethyst',
    nameHi: 'राजसी जामुनी',
    nameMr: 'राजेशाही जांभळा',
    dotColor: '#7E22CE',
    bgMain: 'bg-[#FAF7FD]',
    bgCard: 'bg-white',
    textPrimary: 'text-[#2E1065]',
    textSecondary: 'text-[#5B3A82]',
    accent: 'bg-[#6B21A8]',
    accentBg: 'bg-[#DDD6FE]',
    accentText: 'text-[#581C87]',
    accentBorder: 'border-[#7E22CE]',
    rightPanelBg: 'bg-[#2A0845]',
    borderSubtle: 'border-[#EADBFA]',
  },
  forest: {
    id: 'forest',
    name: 'Midnight Forest (Dark)',
    nameHi: 'गहरा रात का जंगल (डार्क मोड)',
    nameMr: 'मध्यरात्रीचे वन (डार्क मोड)',
    dotColor: '#34D399',
    bgMain: 'bg-[#0A1614]',
    bgCard: 'bg-[#132A26]',
    textPrimary: 'text-[#ECFDF5]',
    textSecondary: 'text-[#A7F3D0]',
    accent: 'bg-[#059669]',
    accentBg: 'bg-[#065F46]',
    accentText: 'text-[#D1FAE5]',
    accentBorder: 'border-[#34D399]',
    rightPanelBg: 'bg-[#071110]',
    borderSubtle: 'border-[#1C3A35]',
  },
};

export const FONT_SIZES: { id: FontSizeName; label: string; scale: string; px: string }[] = [
  { id: 'compact', label: 'Compact (90%)', scale: 'A-', px: '13.5px' },
  { id: 'normal', label: 'Default (100%)', scale: 'A', px: '15px' },
  { id: 'medium', label: 'Medium (110%)', scale: 'A+', px: '16.5px' },
  { id: 'large', label: 'Large (120%)', scale: 'A++', px: '18px' },
  { id: 'xlarge', label: 'Extra Large (135%)', scale: 'A+++', px: '20px' },
];

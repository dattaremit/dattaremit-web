"use client";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { createPersistedStore } from "@/lib/create-persisted-store";

export type ThemePreset =
  | "ocean"
  | "forest"
  | "sunset"
  | "rose"
  | "indigo"
  | "teal"
  | "crimson"
  | "amber";

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  lightBg: string;
  lightSurface: string;
  lightSurfaceDark: string;
  lightBorder: string;
  lightBorderFocus: string;
  darkBg: string;
  darkSurface: string;
  darkSurfaceLight: string;
  darkBorder: string;
  darkBorderFocus: string;
}

export const THEME_PRESETS: Record<ThemePreset, ThemeColors> = {
  ocean: {
    primary: "#2563EB",
    primaryDark: "#1D4ED8",
    primaryLight: "#3B82F6",
    lightBg: "#F0F7FF",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#E8F0FE",
    lightBorder: "#D0DEF0",
    lightBorderFocus: "#2563EB",
    darkBg: "#0C1525",
    darkSurface: "#142036",
    darkSurfaceLight: "#1B2A45",
    darkBorder: "#253552",
    darkBorderFocus: "#2563EB",
  },
  forest: {
    primary: "#059669",
    primaryDark: "#047857",
    primaryLight: "#10B981",
    lightBg: "#F0FDF6",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#E6F5EC",
    lightBorder: "#C6E7D2",
    lightBorderFocus: "#059669",
    darkBg: "#0A1510",
    darkSurface: "#12231A",
    darkSurfaceLight: "#1A3024",
    darkBorder: "#243D2E",
    darkBorderFocus: "#059669",
  },
  sunset: {
    primary: "#EA580C",
    primaryDark: "#C2410C",
    primaryLight: "#F97316",
    lightBg: "#FFFAF5",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#FEF1E8",
    lightBorder: "#F0DFD0",
    lightBorderFocus: "#EA580C",
    darkBg: "#171008",
    darkSurface: "#251C10",
    darkSurfaceLight: "#33261A",
    darkBorder: "#443322",
    darkBorderFocus: "#EA580C",
  },
  rose: {
    primary: "#E11D48",
    primaryDark: "#BE123C",
    primaryLight: "#FB7185",
    lightBg: "#FFF5F7",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#FEE2E8",
    lightBorder: "#F0CDD5",
    lightBorderFocus: "#E11D48",
    darkBg: "#180A10",
    darkSurface: "#26121B",
    darkSurfaceLight: "#341A26",
    darkBorder: "#442433",
    darkBorderFocus: "#E11D48",
  },
  indigo: {
    primary: "#4F46E5",
    primaryDark: "#4338CA",
    primaryLight: "#6366F1",
    lightBg: "#F5F3FF",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#EDE9FE",
    lightBorder: "#D4D0F0",
    lightBorderFocus: "#4F46E5",
    darkBg: "#0E0C1E",
    darkSurface: "#181530",
    darkSurfaceLight: "#211E40",
    darkBorder: "#2D2952",
    darkBorderFocus: "#4F46E5",
  },
  teal: {
    primary: "#0D9488",
    primaryDark: "#0F766E",
    primaryLight: "#14B8A6",
    lightBg: "#F0FDFA",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#E0F5F1",
    lightBorder: "#C4E8E2",
    lightBorderFocus: "#0D9488",
    darkBg: "#0A1413",
    darkSurface: "#12221F",
    darkSurfaceLight: "#1A302C",
    darkBorder: "#243E3A",
    darkBorderFocus: "#0D9488",
  },
  crimson: {
    primary: "#DC2626",
    primaryDark: "#B91C1C",
    primaryLight: "#EF4444",
    lightBg: "#FEF5F5",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#FEE2E2",
    lightBorder: "#F0CDCD",
    lightBorderFocus: "#DC2626",
    darkBg: "#180A0A",
    darkSurface: "#261212",
    darkSurfaceLight: "#341A1A",
    darkBorder: "#442424",
    darkBorderFocus: "#DC2626",
  },
  amber: {
    primary: "#D97706",
    primaryDark: "#B45309",
    primaryLight: "#F59E0B",
    lightBg: "#FFFBF0",
    lightSurface: "#FFFFFF",
    lightSurfaceDark: "#FEF3D0",
    lightBorder: "#F0E0BA",
    lightBorderFocus: "#D97706",
    darkBg: "#161005",
    darkSurface: "#241C0E",
    darkSurfaceLight: "#322818",
    darkBorder: "#443520",
    darkBorderFocus: "#D97706",
  },
};

export const THEME_META: { key: ThemePreset; label: string; color: string }[] = [
  { key: "ocean", label: "Ocean Blue", color: "#2563EB" },
  { key: "forest", label: "Forest Green", color: "#059669" },
  { key: "sunset", label: "Sunset Orange", color: "#EA580C" },
  { key: "rose", label: "Rose", color: "#E11D48" },
  { key: "indigo", label: "Indigo", color: "#4F46E5" },
  { key: "teal", label: "Teal", color: "#0D9488" },
  { key: "crimson", label: "Crimson", color: "#DC2626" },
  { key: "amber", label: "Amber", color: "#D97706" },
];

const VALID_PRESETS: ThemePreset[] = [
  "ocean",
  "forest",
  "sunset",
  "rose",
  "indigo",
  "teal",
  "crimson",
  "amber",
];

const themeStore = createPersistedStore<ThemePreset>({
  storageKey: STORAGE_KEYS.THEME_PRESET,
  defaultValue: "teal",
  validValues: VALID_PRESETS,
});

export function useThemeStore() {
  const { current: preset, isLoaded, set } = themeStore.useStore();
  const colors = THEME_PRESETS[preset];

  return { preset, colors, isLoaded, setPreset: set };
}

export function buildThemeCssVars(colors: ThemeColors): Record<string, string> {
  return {
    "--color-primary": colors.primary,
    "--color-primary-dark": colors.primaryDark,
    "--color-primary-light": colors.primaryLight,
    "--color-light-bg": colors.lightBg,
    "--color-light-surface": colors.lightSurface,
    "--color-light-surface-dark": colors.lightSurfaceDark,
    "--color-light-border": colors.lightBorder,
    "--color-light-border-focus": colors.lightBorderFocus,
    "--color-dark-bg": colors.darkBg,
    "--color-dark-surface": colors.darkSurface,
    "--color-dark-surface-light": colors.darkSurfaceLight,
    "--color-dark-border": colors.darkBorder,
    "--color-dark-border-focus": colors.darkBorderFocus,
  };
}

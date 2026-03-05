import { Theme, ThemeType } from "../../types/index.js";
import { AuroraTheme } from "./aurora-theme.js";
import { CyberpunkTheme } from "./cyberpunk-theme.js";
import { RetroTheme } from "./retro-theme.js";
import { MinimalTheme } from "./minimal-theme.js";
import { CodexTheme } from "./codex-theme.js";
import { ElegantGradientTheme } from "./elegant-gradient-theme.js";

export const THEMES: Record<ThemeType, Theme> = {
  aurora: new AuroraTheme(),
  cyberpunk: new CyberpunkTheme(),
  retro: new RetroTheme(),
  minimal: new MinimalTheme(),
  codex: new CodexTheme(),
  elegant: new ElegantGradientTheme(),
};

export function getTheme(type: ThemeType): Theme {
  return THEMES[type] || THEMES.elegant;
}

export function listThemes(): { type: ThemeType; name: string; description: string }[] {
  return Object.entries(THEMES).map(([type, theme]) => ({
    type: type as ThemeType,
    name: theme.displayName,
    description: theme.description,
  }));
}

export { AuroraTheme } from "./aurora-theme.js";
export { CyberpunkTheme } from "./cyberpunk-theme.js";
export { RetroTheme } from "./retro-theme.js";
export { MinimalTheme } from "./minimal-theme.js";
export { CodexTheme } from "./codex-theme.js";
export { ElegantGradientTheme } from "./elegant-gradient-theme.js";

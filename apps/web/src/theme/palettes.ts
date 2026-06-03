import type { TranslationKey } from "../i18n.types"

export type ColorPaletteName =
  | "dracula"
  | "gruvbox"
  | "nord"
  | "catppuccin"
  | "solarized"

export interface ColorPaletteDefinition {
  background: string
  border: string
  borderHover: string
  iconMuted: string
  i18nKey: TranslationKey
  mutedText: string
  panelBackground: string
  panelBackgroundHover: string
  accent: string
  successBackground: string
  successHoverBackground: string
  successText: string
  text: string
}

export const defaultColorPalette: ColorPaletteName = "dracula"

export const colorPaletteDefinitions: Record<
  ColorPaletteName,
  ColorPaletteDefinition
> = {
  dracula: {
    i18nKey: "palette.dracula",
    background: "#282a36",
    panelBackground: "#303445",
    panelBackgroundHover: "#3a3f55",
    text: "#f8f8f2",
    mutedText: "#a0a8c0",
    accent: "#bd93f9",
    border: "#44475a",
    borderHover: "#6272a4",
    successBackground: "#50fa7b",
    successHoverBackground: "#43d967",
    successText: "#1f232d",
    iconMuted: "#8be9fd",
  },
  gruvbox: {
    i18nKey: "palette.gruvbox",
    background: "#282828",
    panelBackground: "#32302f",
    panelBackgroundHover: "#3c3836",
    text: "#ebdbb2",
    mutedText: "#a89984",
    accent: "#d79921",
    border: "#504945",
    borderHover: "#665c54",
    successBackground: "#98971a",
    successHoverBackground: "#7f801a",
    successText: "#1d2021",
    iconMuted: "#83a598",
  },
  nord: {
    i18nKey: "palette.nord",
    background: "#2e3440",
    panelBackground: "#3b4252",
    panelBackgroundHover: "#434c5e",
    text: "#eceff4",
    mutedText: "#a3b1c6",
    accent: "#88c0d0",
    border: "#4c566a",
    borderHover: "#81a1c1",
    successBackground: "#a3be8c",
    successHoverBackground: "#8fb07a",
    successText: "#2e3440",
    iconMuted: "#81a1c1",
  },
  catppuccin: {
    i18nKey: "palette.catppuccin",
    background: "#1e1e2e",
    panelBackground: "#313244",
    panelBackgroundHover: "#45475a",
    text: "#cdd6f4",
    mutedText: "#a6adc8",
    accent: "#cba6f7",
    border: "#585b70",
    borderHover: "#89b4fa",
    successBackground: "#a6e3a1",
    successHoverBackground: "#89d88b",
    successText: "#1e1e2e",
    iconMuted: "#89b4fa",
  },
  solarized: {
    i18nKey: "palette.solarized",
    background: "#002b36",
    panelBackground: "#073642",
    panelBackgroundHover: "#0b3f4b",
    text: "#eee8d5",
    mutedText: "#93a1a1",
    accent: "#b58900",
    border: "#586e75",
    borderHover: "#657b83",
    successBackground: "#859900",
    successHoverBackground: "#6b7e00",
    successText: "#002b36",
    iconMuted: "#2aa198",
  },
}

export const colorPaletteOptions = (
  Object.keys(colorPaletteDefinitions) as ColorPaletteName[]
).map((value) => ({
  value,
  i18nKey: colorPaletteDefinitions[value].i18nKey,
}))

export const isColorPaletteName = (
  value: string | null,
): value is ColorPaletteName =>
  value !== null && Object.hasOwn(colorPaletteDefinitions, value)

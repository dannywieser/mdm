import type { TranslationKey } from "../i18n.types"

export type ColorPaletteName =
  | "dracula"
  | "gruvbox"
  | "nord"
  | "catppuccin"
  | "solarized"
  | "gotham"
  | "highContrast"
  | "ocean"

export interface ColorPaletteVariant {
  background: string
  border: string
  borderHover: string
  iconMuted: string
  mutedText: string
  panelBackground: string
  panelBackgroundHover: string
  accent: string
  successBackground: string
  successHoverBackground: string
  successText: string
  text: string
}

export interface ColorPaletteDefinition {
  i18nKey: TranslationKey
  dark: ColorPaletteVariant
  light: ColorPaletteVariant
}

export const defaultColorPalette: ColorPaletteName = "dracula"

export const colorPaletteDefinitions: Record<
  ColorPaletteName,
  ColorPaletteDefinition
> = {
  dracula: {
    i18nKey: "palette.dracula",
    dark: {
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
    get light() {
      return this.dark
    },
  },
  gruvbox: {
    i18nKey: "palette.gruvbox",
    dark: {
      background: "#282828",
      panelBackground: "#3c3836",
      panelBackgroundHover: "#46403c",
      text: "#ebdbb2",
      mutedText: "#b5a292",
      accent: "#d79921",
      border: "#504945",
      borderHover: "#665c54",
      successBackground: "#98971a",
      successHoverBackground: "#7f801a",
      successText: "#1d2021",
      iconMuted: "#83a598",
    },
    light: {
      background: "#fbf1c7",
      panelBackground: "#e8d5a3",
      panelBackgroundHover: "#dcc990",
      text: "#3c3836",
      mutedText: "#5c5248",
      accent: "#076678",
      border: "#d5c4a1",
      borderHover: "#bdae93",
      successBackground: "#79740e",
      successHoverBackground: "#5f5b08",
      successText: "#fbf1c7",
      iconMuted: "#427b58",
    },
  },
  nord: {
    i18nKey: "palette.nord",
    dark: {
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
    light: {
      background: "#eceff4",
      panelBackground: "#e5e9f0",
      panelBackgroundHover: "#d8dee9",
      text: "#2e3440",
      mutedText: "#4c566a",
      accent: "#5e81ac",
      border: "#d8dee9",
      borderHover: "#81a1c1",
      successBackground: "#4c7a34",
      successHoverBackground: "#3d6329",
      successText: "#eceff4",
      iconMuted: "#5e81ac",
    },
  },
  catppuccin: {
    i18nKey: "palette.catppuccin",
    dark: {
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
    light: {
      background: "#eff1f5",
      panelBackground: "#e6e9ef",
      panelBackgroundHover: "#dce0e8",
      text: "#4c4f69",
      mutedText: "#626578",
      accent: "#8839ef",
      border: "#ccd0da",
      borderHover: "#acb0be",
      successBackground: "#40a02b",
      successHoverBackground: "#329021",
      successText: "#eff1f5",
      iconMuted: "#209fb5",
    },
  },
  solarized: {
    i18nKey: "palette.solarized",
    dark: {
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
    light: {
      background: "#fdf6e3",
      panelBackground: "#eee8d5",
      panelBackgroundHover: "#ddd6c2",
      text: "#073642",
      mutedText: "#506870",
      accent: "#268bd2",
      border: "#d3cbb8",
      borderHover: "#b5ae9f",
      successBackground: "#859900",
      successHoverBackground: "#6b7e00",
      successText: "#fdf6e3",
      iconMuted: "#2aa198",
    },
  },
  gotham: {
    i18nKey: "palette.gotham",
    dark: {
      background: "#0c1014",
      panelBackground: "#10151c",
      panelBackgroundHover: "#1a2330",
      text: "#c5d8de",
      mutedText: "#7a94a5",
      accent: "#7ecbd4",
      border: "#1f2b38",
      borderHover: "#2d3f52",
      successBackground: "#2aa198",
      successHoverBackground: "#218f87",
      successText: "#0c1014",
      iconMuted: "#195465",
    },
    get light() {
      return this.dark
    },
  },
  ocean: {
    i18nKey: "palette.ocean",
    dark: {
      background: "#0d1b2e",
      panelBackground: "#112340",
      panelBackgroundHover: "#1a2f52",
      text: "#e2f0fb",
      mutedText: "#7bafd4",
      accent: "#38c4e8",
      border: "#1c3354",
      borderHover: "#2a4f7a",
      successBackground: "#22d07a",
      successHoverBackground: "#1ab868",
      successText: "#071018",
      iconMuted: "#56c0e0",
    },
    get light() {
      return this.dark
    },
  },
  highContrast: {
    i18nKey: "palette.highContrast",
    light: {
      background: "#ffffff",
      panelBackground: "#f0f3f6",
      panelBackgroundHover: "#dde0e4",
      text: "#0e1116",
      mutedText: "#424a53",
      accent: "#0349b4",
      border: "#818b98",
      borderHover: "#20252c",
      successBackground: "#055d20",
      successHoverBackground: "#024c1a",
      successText: "#ffffff",
      iconMuted: "#0a86b5",
    },
    get dark() {
      return this.light
    },
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

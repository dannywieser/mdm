import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

import {
  colorPaletteDefinitions,
  defaultColorPalette,
  type ColorPaletteName,
} from "./palettes"

const createPaletteSystem = (paletteName: ColorPaletteName) => {
  const { dark, light } = colorPaletteDefinitions[paletteName]

  const config = defineConfig({
    globalCss: {
      "html, body": {
        bg: "app.background",
        color: "app.text",
      },
    },
    theme: {
      slotRecipes: {
        stat: {
          slots: ["root", "indicator", "label", "valueText", "helpText", "valueUnit"],
          base: {
            label: { color: "app.text" },
          },
        },
      },
      semanticTokens: {
        colors: {
          app: {
            background: { value: { base: light.background, _dark: dark.background } },
            text: { value: { base: light.text, _dark: dark.text } },
            textMuted: { value: { base: light.mutedText, _dark: dark.mutedText } },
            border: { value: { base: light.border, _dark: dark.border } },
            borderHover: { value: { base: light.borderHover, _dark: dark.borderHover } },
            iconMuted: { value: { base: light.iconMuted, _dark: dark.iconMuted } },
            accent: { value: { base: light.accent, _dark: dark.accent } },
            panelBackground: { value: { base: light.panelBackground, _dark: dark.panelBackground } },
            panelBackgroundHover: { value: { base: light.panelBackgroundHover, _dark: dark.panelBackgroundHover } },
            successBackground: { value: { base: light.successBackground, _dark: dark.successBackground } },
            successHoverBackground: { value: { base: light.successHoverBackground, _dark: dark.successHoverBackground } },
            successText: { value: { base: light.successText, _dark: dark.successText } },
          },
        },
      },
    },
  })

  return createSystem(defaultConfig, config)
}

export const colorPaletteSystems: Record<ColorPaletteName, ReturnType<typeof createSystem>> = {
  dracula: createPaletteSystem("dracula"),
  gruvbox: createPaletteSystem("gruvbox"),
  nord: createPaletteSystem("nord"),
  catppuccin: createPaletteSystem("catppuccin"),
  solarized: createPaletteSystem("solarized"),
  gotham: createPaletteSystem("gotham"),
}

export const defaultColorPaletteSystem =
  colorPaletteSystems[defaultColorPalette]

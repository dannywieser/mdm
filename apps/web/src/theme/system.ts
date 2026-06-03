import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

import {
  colorPaletteDefinitions,
  defaultColorPalette,
  type ColorPaletteName,
} from "./palettes"

const createPaletteSystem = (paletteName: ColorPaletteName) => {
  const palette = colorPaletteDefinitions[paletteName]

  const config = defineConfig({
    globalCss: {
      "html, body": {
        bg: "app.background",
        color: "app.text",
      },
    },
    theme: {
      semanticTokens: {
        colors: {
          app: {
            background: { value: palette.background },
            text: { value: palette.text },
            textMuted: { value: palette.mutedText },
            border: { value: palette.border },
            borderHover: { value: palette.borderHover },
            iconMuted: { value: palette.iconMuted },
            selectedText: { value: palette.selectedText },
            panelBackground: { value: palette.panelBackground },
            panelBackgroundHover: { value: palette.panelBackgroundHover },
            successBackground: { value: palette.successBackground },
            successHoverBackground: { value: palette.successHoverBackground },
            successText: { value: palette.successText },
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
}

export const defaultColorPaletteSystem =
  colorPaletteSystems[defaultColorPalette]

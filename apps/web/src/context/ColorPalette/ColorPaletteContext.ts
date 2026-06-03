import { createContext } from "react"

import { defaultColorPalette } from "../../theme/palettes"

import type { ColorPaletteContextValue } from "./ColorPalette.types"

export const ColorPaletteContext = createContext<ColorPaletteContextValue>({
  palette: defaultColorPalette,
  setPalette: () => {},
})

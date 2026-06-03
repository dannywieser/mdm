import { createContext } from "react"

import type { ColorPaletteContextValue } from "./ColorPalette.types"

export const ColorPaletteContext = createContext<ColorPaletteContextValue | undefined>(
  undefined,
)

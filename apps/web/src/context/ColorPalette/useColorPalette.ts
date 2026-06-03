import { useContext } from "react"

import { ColorPaletteContext } from "./ColorPaletteContext"
import type { ColorPaletteContextValue } from "./ColorPalette.types"

export const useColorPalette = (): ColorPaletteContextValue =>
  useContext(ColorPaletteContext)

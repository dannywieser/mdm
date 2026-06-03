import { useContext } from "react"

import { ColorPaletteContext } from "./ColorPaletteContext"
import type { ColorPaletteContextValue } from "./ColorPalette.types"

export const useColorPalette = (): ColorPaletteContextValue => {
  const context = useContext(ColorPaletteContext)

  if (!context) {
    throw new Error("useColorPalette must be used within ColorPaletteProvider")
  }

  return context
}

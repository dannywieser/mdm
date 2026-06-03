import type { ColorPaletteName } from "../../theme/palettes"

export interface ColorPaletteContextValue {
  palette: ColorPaletteName
  setPalette: (palette: ColorPaletteName) => void
}

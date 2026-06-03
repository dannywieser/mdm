import { ChakraProvider } from "@chakra-ui/react"
import { useEffect, useMemo, useState, type ReactNode } from "react"

import {
  colorPaletteSystems,
  defaultColorPaletteSystem,
} from "../../theme/system"
import {
  defaultColorPalette,
  isColorPaletteName,
  type ColorPaletteName,
} from "../../theme/palettes"

import { ColorPaletteContext } from "./ColorPaletteContext"

export const colorPaletteStorageKey = "mdm.colorPalette"

const getInitialColorPalette = (): ColorPaletteName => {
  if (typeof window === "undefined") {
    return defaultColorPalette
  }

  const storedValue = window.localStorage.getItem(colorPaletteStorageKey)

  return isColorPaletteName(storedValue) ? storedValue : defaultColorPalette
}

export const ColorPaletteProvider = ({ children }: { children: ReactNode }) => {
  const [palette, setPalette] = useState<ColorPaletteName>(getInitialColorPalette)

  useEffect(() => {
    const currentValue = window.localStorage.getItem(colorPaletteStorageKey)

    if (currentValue !== palette) {
      window.localStorage.setItem(colorPaletteStorageKey, palette)
    }
  }, [palette])

  const system = useMemo(
    () => colorPaletteSystems[palette] ?? defaultColorPaletteSystem,
    [palette],
  )

  return (
    <ColorPaletteContext.Provider value={{ palette, setPalette }}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </ColorPaletteContext.Provider>
  )
}

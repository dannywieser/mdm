import { NativeSelect } from "@chakra-ui/react"

import { useColorPalette } from "../../context/ColorPalette/useColorPalette"
import { colorPaletteOptions } from "../../theme/palettes"

export const PaletteSelector = () => {
  const { palette, setPalette } = useColorPalette()

  return (
    <NativeSelect.Root size="xs" width="140px">
      <NativeSelect.Field
        aria-label="Color palette"
        bg="app.panelBackground"
        borderColor="app.border"
        color="app.text"
        value={palette}
        onChange={(event) => setPalette(event.currentTarget.value as typeof palette)}
      >
        {colorPaletteOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator color="app.textMuted" />
    </NativeSelect.Root>
  )
}

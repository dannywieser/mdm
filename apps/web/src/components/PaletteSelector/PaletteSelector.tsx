import { Box, Tooltip } from "@chakra-ui/react"
import { Palette } from "lucide-react"
import { Link } from "react-router-dom"

import { useColorPalette } from "../../context/ColorPalette/useColorPalette"
import { useI18n } from "../../i18n"
import { colorPaletteDefinitions } from "../../theme/palettes"

export const PaletteSelector = () => {
  const { palette } = useColorPalette()
  const { t } = useI18n()

  return (
    <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <Box
          as={Link}
          to="/colors"
          data-testid="palette-selector-trigger"
          aria-label="Select color palette"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="1.5"
          borderRadius="md"
          color={colorPaletteDefinitions[palette].dark.accent}
          _hover={{ bg: "app.panelBackgroundHover" }}
          transition="background 0.15s"
        >
          <Palette size={20} />
        </Box>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{t("header.colorPalette")}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

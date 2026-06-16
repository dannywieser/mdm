import { chakra, Tooltip } from "@chakra-ui/react"
import { Palette } from "lucide-react"
import { Link } from "react-router-dom"

const RouterLink = chakra(Link)

import { focusRing } from "../../theme/focusRing"
import { useColorPalette } from "../../context/ColorPalette/useColorPalette"
import { useI18n } from "../../i18n"
import { colorPaletteDefinitions } from "../../theme/palettes"

export const PaletteSelector = () => {
  const { palette } = useColorPalette()
  const { t } = useI18n()

  return (
    <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
      <Tooltip.Trigger asChild>
        <RouterLink
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
          {...focusRing}
        >
          <Palette size={20} />
        </RouterLink>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>{t("header.colorPalette")}</Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  )
}

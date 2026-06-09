import { Box, Flex, Popover, Text, Tooltip } from "@chakra-ui/react"
import { Palette } from "lucide-react"
import { useState } from "react"

import { useColorPalette } from "../../context/ColorPalette/useColorPalette"
import { useI18n } from "../../i18n"
import {
  colorPaletteDefinitions,
  colorPaletteOptions,
  type ColorPaletteName,
} from "../../theme/palettes"

export const PaletteSelector = () => {
  const { palette, setPalette } = useColorPalette()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
      positioning={{ placement: "bottom-end" }}
    >
      <Tooltip.Root openDelay={300} positioning={{ placement: "bottom" }}>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Box
              as="button"
              data-testid="palette-selector-trigger"
              aria-label="Select color palette"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              flexShrink={0}
              p="1.5"
              borderRadius="md"
              color={colorPaletteDefinitions[palette].dark.accent}
              _hover={{ bg: "app.panelBackgroundHover" }}
              transition="background 0.15s"
            >
              <Palette size={20} />
            </Box>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content>{t("header.colorPalette")}</Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
      <Popover.Positioner>
        <Popover.Content
          bg="app.panelBackground"
          borderColor="app.border"
          borderWidth="1px"
          borderRadius="md"
          p="3"
          w="auto"
        >
          <Flex direction="column" gap="1">
            {colorPaletteOptions.map((option) => {
              const isActive = palette === option.value
              const accentColor = colorPaletteDefinitions[option.value].dark.accent
              return (
                <Box
                  key={option.value}
                  as="button"
                  data-testid={`palette-option-${option.value}`}
                  aria-label={option.i18nKey}
                  aria-pressed={isActive}
                  display="flex"
                  alignItems="center"
                  gap="2"
                  cursor="pointer"
                  px="1"
                  py="0.5"
                  borderRadius="sm"
                  onClick={() => {
                    setPalette(option.value as ColorPaletteName)
                    setOpen(false)
                  }}
                  _hover={{ opacity: 0.8 }}
                >
                  <Box as="span" color={accentColor} display="flex" alignItems="center">
                    <Palette size={14} fill={isActive ? accentColor : "none"} />
                  </Box>
                  <Text fontSize="xs" color={isActive ? "app.text" : "app.textMuted"} fontWeight={isActive ? "semibold" : "normal"}>
                    {t(option.i18nKey)}
                  </Text>
                </Box>
              )
            })}
          </Flex>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}

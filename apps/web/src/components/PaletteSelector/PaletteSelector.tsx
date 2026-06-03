import { Box, Flex, Popover, Text } from "@chakra-ui/react"
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
      <Popover.Trigger asChild>
        <Box
          as="button"
          data-testid="palette-selector-trigger"
          aria-label="Select color palette"
          w="4"
          h="4"
          borderRadius="full"
          bg={colorPaletteDefinitions[palette].accent}
          border="2px solid"
          borderColor="app.border"
          cursor="pointer"
          flexShrink={0}
          _hover={{ borderColor: "app.borderHover" }}
        />
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          bg="app.panelBackground"
          borderColor="app.border"
          p="3"
          w="auto"
        >
          <Flex gap="3">
            {colorPaletteOptions.map((option) => {
              const isActive = palette === option.value
              return (
                <Box
                  key={option.value}
                  as="button"
                  data-testid={`palette-option-${option.value}`}
                  aria-label={option.i18nKey}
                  aria-pressed={isActive}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap="1.5"
                  cursor="pointer"
                  onClick={() => {
                    setPalette(option.value as ColorPaletteName)
                    setOpen(false)
                  }}
                  _hover={{ opacity: 0.8 }}
                >
                  <Box
                    w="5"
                    h="5"
                    borderRadius="full"
                    bg={colorPaletteDefinitions[option.value].accent}
                    border="2px solid"
                    borderColor={isActive ? "app.text" : "app.border"}
                  />
                  <Text fontSize="2xs" color="app.textMuted">
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

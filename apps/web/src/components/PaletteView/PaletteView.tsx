import { Box, Grid, Text, VStack } from "@chakra-ui/react"

import { useColorPalette } from "../../context/ColorPalette/useColorPalette"
import { useI18n } from "../../i18n"
import {
  colorPaletteDefinitions,
  colorPaletteOptions,
  type ColorPaletteName,
} from "../../theme/palettes"

import { PalettePreview } from "../PalettePreview/PalettePreview"

export function PaletteView() {
  const { palette, setPalette } = useColorPalette()
  const { t } = useI18n()

  return (
    <VStack align="center" pt={8} px={4} pb={16}>
      <Grid
        templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={4}
        w="full"
        maxW="5xl"
      >
        {colorPaletteOptions.map((option) => {
          const def = colorPaletteDefinitions[option.value]
          const isActive = palette === option.value
          const colors = def.dark

          return (
            <Box
              key={option.value}
              as="button"
              data-testid={`palette-option-${option.value}`}
              aria-label={option.i18nKey}
              aria-pressed={isActive}
              onClick={() => setPalette(option.value as ColorPaletteName)}
              borderWidth="2px"
              borderColor={isActive ? "app.accent" : "app.border"}
              borderRadius="lg"
              p={3}
              textAlign="left"
              cursor="pointer"
              w="full"
              _hover={{ borderColor: isActive ? "app.accent" : "app.borderHover", bg: "app.panelBackground" }}
              _focusVisible={{ borderColor: isActive ? "app.accent" : "app.borderHover", bg: "app.panelBackground", outline: "none" }}
              transition="border-color 0.15s, background 0.15s"
            >
              <PalettePreview paletteName={option.value} colors={colors} />
              <Box mt={2.5} display="flex" alignItems="center" gap={2}>
                <Box
                  as="span"
                  display="inline-block"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  flexShrink={0}
                  style={{ backgroundColor: colors.accent }}
                />
                <Text
                  fontSize="sm"
                  fontWeight={isActive ? "semibold" : "normal"}
                  color="app.text"
                >
                  {t(def.i18nKey)}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Grid>
    </VStack>
  )
}

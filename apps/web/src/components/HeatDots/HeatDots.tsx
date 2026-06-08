import { Box, Flex } from "@chakra-ui/react"

import { useI18n } from "../../i18n"

import type { HeatDotsProps } from "./HeatDots.types"

export function HeatDots({ count }: HeatDotsProps) {
  const { t } = useI18n()

  if (count <= 0) return null

  return (
    <Flex aria-label={t("habit.heatLevel", { count })} gap={1}>
      {Array.from({ length: count }, (_, index) => (
        <Box key={index} w="8px" h="8px" borderRadius="full" bg="red.500" />
      ))}
    </Flex>
  )
}

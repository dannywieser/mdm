import { Box, Flex } from "@chakra-ui/react"

import { useI18n } from "../../i18n"

import type { HeatDotsProps } from "./HeatDots.types"
import { splitDotsIntoRows } from "./HeatDots.util"

export function HeatDots({ count }: Readonly<HeatDotsProps>) {
  const { t } = useI18n()

  if (count <= 0) return null

  const rows = splitDotsIntoRows(count)

  return (
    <Flex aria-label={t("habit.heatLevel", { count })} direction="column" gap={1}>
      {rows.map((rowCount, rowIndex) => (
        <Flex key={rowIndex} gap={1}>
          {Array.from({ length: rowCount }, (_, dotIndex) => (
            <Box
              key={dotIndex}
              data-testid="heat-dot"
              w="8px"
              h="8px"
              borderRadius="full"
              bg="red.500"
            />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

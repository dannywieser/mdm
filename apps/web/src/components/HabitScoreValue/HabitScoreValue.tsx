import { StatValueText, Text } from "@chakra-ui/react"

import type { HabitScoreValueProps } from "./HabitScoreValue.types"
import { getHabitScoreColor, getHabitScoreOverage } from "./HabitScoreValue.util"

export function HabitScoreValue({ mode, score, targetScore }: Readonly<HabitScoreValueProps>) {
  const overage = getHabitScoreOverage(mode, score, targetScore)

  return (
    <StatValueText color={getHabitScoreColor(mode, score, targetScore)}>
      {score}
      {overage !== undefined && (
        <Text as="span" color="orange.400" ml={1}>
          (+{overage})
        </Text>
      )}
    </StatValueText>
  )
}

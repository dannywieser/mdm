import { StatValueText } from "@chakra-ui/react"

import type { HabitScoreValueProps } from "./HabitScoreValue.types"
import { getHabitScoreColor } from "./HabitScoreValue.util"

export function HabitScoreValue({ mode, score, targetScore }: Readonly<HabitScoreValueProps>) {
  return <StatValueText color={getHabitScoreColor(mode, score, targetScore)}>{score}</StatValueText>
}

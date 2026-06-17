import { Box, Flex, Progress } from "@chakra-ui/react"

import type { HabitScoreProgressProps } from "./HabitScoreProgress.types"
import { calculateOverflowRatio, calculateProgressFraction } from "./HabitScoreProgress.util"

const BAR_HEIGHT = "1.5"

export function HabitScoreProgress({ score, targetScore }: Readonly<HabitScoreProgressProps>) {
  if (targetScore === undefined) return null

  const progressFraction = calculateProgressFraction(score, targetScore)
  const overflowRatio = calculateOverflowRatio(score, targetScore)

  return (
    <Flex align="center" width="full" gap={0}>
      <Box flex="1" minW={0}>
        <Progress.Root value={progressFraction * 100} w="full">
          <Progress.Track h={BAR_HEIGHT} borderRightRadius={overflowRatio > 0 ? 0 : "full"}>
            <Progress.Range bg="app.accent" />
          </Progress.Track>
        </Progress.Root>
      </Box>
      {overflowRatio > 0 && (
        <Box flex={overflowRatio} minW="6px" h={BAR_HEIGHT} bg="red.500" borderRightRadius="full" />
      )}
    </Flex>
  )
}

import { Box, Flex, SimpleGrid, StatLabel, StatRoot, StatValueText, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"

import { HabitScoreValue } from "../HabitScoreValue/HabitScoreValue"
import { HeatDots } from "../HeatDots/HeatDots"
import { calculateHeatDotCount } from "../HeatDots/HeatDots.util"
import type { HabitCardProps } from "./HabitCard.types"

export function HabitCard({ habit }: HabitCardProps) {
  const { t } = useI18n()
  const heatDotCount = calculateHeatDotCount(habit.mode, habit.habitScore, habit.targetScore)

  return (
    <Box
      borderRadius="md"
      _focusWithin={{
        outlineWidth: "2px",
        outlineStyle: "solid",
        outlineColor: "app.accent",
        outlineOffset: "2px",
      }}
    >
      <Link
        style={{ textDecoration: "none", outline: "none", display: "block", width: "100%" }}
        to={`/tracking/${habit.habitId}`}
      >
        <Box
          borderColor="app.border"
          borderRadius="md"
          borderWidth="1px"
          backgroundColor="app.panelBackground"
          px={3}
          py={2}
          width="full"
          _hover={{ borderColor: "app.borderHover" }}
        >
          <Text fontSize="sm" fontWeight="semibold" color="app.text" mb={2}>
            {t(habit.mode === "do-more" ? "habit.modeDoMore" : "habit.modeDoLess")}: {habit.habitName}
          </Text>
          <SimpleGrid columns={3} gap={3}>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.score")}</StatLabel>
              <Flex align="center" gap={1.5}>
                <HabitScoreValue mode={habit.mode} score={habit.habitScore} targetScore={habit.targetScore} />
                <HeatDots count={heatDotCount} />
              </Flex>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.currentStreak")}</StatLabel>
              <StatValueText>{habit.streak}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.totalDays")}</StatLabel>
              <StatValueText>{habit.windowEntries}</StatValueText>
            </StatRoot>
          </SimpleGrid>
        </Box>
      </Link>
    </Box>
  )
}

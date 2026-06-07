import { Box, StatLabel, StatRoot, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"

import { HabitScoreValue } from "../HabitScoreValue/HabitScoreValue"
import type { HabitCardProps } from "./HabitCard.types"

export function HabitCard({ habit }: HabitCardProps) {
  const { t } = useI18n()

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
        style={{ textDecoration: "none", outline: "none" }}
        to={`/tracking/${habit.habitId}`}
      >
        <StatRoot
          borderColor="app.border"
          borderRadius="md"
          borderWidth="1px"
          backgroundColor="app.panelBackground"
          px={3}
          py={2}
          size="sm"
          _hover={{ borderColor: "app.borderHover" }}
        >
          <StatLabel>{habit.habitName}</StatLabel>
          <HabitScoreValue mode={habit.mode} score={habit.habitScore} targetScore={habit.targetScore} />
          <Text fontSize="xs" color="app.textMuted">
            {t("habit.currentStreak")}: {habit.streak}
          </Text>
        </StatRoot>
      </Link>
    </Box>
  )
}

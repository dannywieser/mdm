import {
  Box,
  SimpleGrid,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"

import { useI18n } from "../../i18n"

import { HabitScoreValue } from "../HabitScoreValue"
import type { HabitCardProps } from "./HabitCard.types"

export function HabitCard({ habit }: Readonly<HabitCardProps>) {
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
        style={{
          textDecoration: "none",
          outline: "none",
          display: "block",
          width: "100%",
        }}
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
          <StatRoot size="sm" mb={2}>
            <StatLabel>
              {t(`habit.${habit.mode}`, { name: habit.habitName })}
            </StatLabel>
          </StatRoot>
          <SimpleGrid columns={3} gap={3}>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">{t("habit.score")}</StatLabel>
              <HabitScoreValue
                mode={habit.mode}
                score={habit.habitScore}
                targetScore={habit.targetScore}
              />
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">
                {t(`habit.${habit.mode}-streak`)}
              </StatLabel>
              <StatValueText>{habit.streak}</StatValueText>
            </StatRoot>
            <StatRoot size="sm">
              <StatLabel color="app.textMuted">
                {t("habit.totalDays")}
              </StatLabel>
              <StatValueText>{habit.windowEntries}</StatValueText>
            </StatRoot>
          </SimpleGrid>
        </Box>
      </Link>
    </Box>
  )
}

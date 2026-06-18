import { Box, Flex, Text, VStack } from "@chakra-ui/react"

import { useI18n } from "../../i18n"
import type { BonusTier, ScoreBreakdownProps } from "./ScoreBreakdown.types"
import {
  calculateScoreContributions,
  formatContributionAmount,
  formatTierLabel,
} from "./ScoreBreakdown.util"

function TierRows({ tiers, prefix, color }: Readonly<{ tiers: BonusTier[]; prefix: string; color: string }>) {
  return (
    <>
      {tiers.map((tier) => (
        <Flex key={`${prefix}-${tier.startDay}`} justify="space-between" align="center">
          <Text color="app.textMuted">{formatTierLabel(prefix, tier.startDay, tier.endDay, tier.rate)}</Text>
          <Text color={color} fontVariantNumeric="tabular-nums">
            {formatContributionAmount(tier.amount)}
          </Text>
        </Flex>
      ))}
    </>
  )
}

export function ScoreBreakdown({
  mode,
  scoreBeforeMultipliers,
  dayMultiplier,
  streakMultiplier,
  windowEntries,
  streak,
  habitScore,
}: Readonly<ScoreBreakdownProps>) {
  const { t } = useI18n()
  const { daysTiers, streakTiers } = calculateScoreContributions(
    scoreBeforeMultipliers,
    dayMultiplier,
    streakMultiplier,
    windowEntries,
    streak,
  )

  const daysColor = mode === "do-more" ? "green.500" : "red.500"

  return (
    <Box
      borderWidth="1px"
      borderColor="app.border"
      borderRadius="md"
      overflow="hidden"
      fontSize="xs"
      color="app.text"
    >
      <Text
        fontSize="xs"
        color="app.textMuted"
        letterSpacing="wide"
        px={3}
        py={2}
        bg="app.panelBackgroundHover"
        borderBottomWidth="1px"
        borderColor="app.border"
      >
        {t("habit.scoreBreakdown")}
      </Text>
      <VStack align="stretch" gap={0} px={3} py={2} divideY="1px" divideColor="app.border">
        <Flex justify="space-between" align="center" py={1.5}>
          <Text color="app.textMuted">{t("habit.scoreBreakdownEntries")}</Text>
          <Text fontVariantNumeric="tabular-nums">{scoreBeforeMultipliers}</Text>
        </Flex>
        {daysTiers.length > 0 && (
          <VStack align="stretch" gap={1} py={1.5}>
            <Text color="app.textMuted">
              {mode === "do-more"
                ? t("habit.scoreBreakdownDaysBonus")
                : t("habit.scoreBreakdownDaysPenalty")}
            </Text>
            <TierRows tiers={daysTiers} prefix="days" color={daysColor} />
          </VStack>
        )}
        {streakTiers.length > 0 && (
          <VStack align="stretch" gap={1} py={1.5}>
            <Text color="app.textMuted">{t("habit.scoreBreakdownStreakBonus")}</Text>
            <TierRows tiers={streakTiers} prefix="streak" color="green.500" />
          </VStack>
        )}
        <Flex justify="space-between" align="center" py={1.5}>
          <Text fontWeight="semibold">{t("habit.scoreBreakdownFinalScore")}</Text>
          <Text fontWeight="semibold" fontVariantNumeric="tabular-nums">{habitScore}</Text>
        </Flex>
      </VStack>
    </Box>
  )
}

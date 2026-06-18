export const formatChartDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const formatEntryValue = (value: number, recentMultiplier: number | undefined): string =>
  recentMultiplier === undefined ? `${value}` : `${value} (x${recentMultiplier})`

export const calculateWindowFillPercentage = (windowEntries: number, trackingWindowDays: number): number =>
  Math.round((windowEntries / trackingWindowDays) * 100)

export interface ScoreContributions {
  entryScores: number
  daysBonusAmount: number
  streakBonusAmount: number
}

export const calculateScoreContributions = (
  scoreBeforeMultipliers: number,
  dayMultiplier: number,
  streakMultiplier: number,
): ScoreContributions => {
  const afterDayBonus = scoreBeforeMultipliers * (1 + dayMultiplier)
  return {
    entryScores: scoreBeforeMultipliers,
    daysBonusAmount: scoreBeforeMultipliers * dayMultiplier,
    streakBonusAmount: afterDayBonus * streakMultiplier,
  }
}

export const formatContributionAmount = (amount: number): string => {
  const rounded = Math.round(amount * 10) / 10
  const sign = rounded >= 0 ? "+" : ""
  return `${sign}${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}`
}

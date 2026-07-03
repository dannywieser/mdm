export const formatChartDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const formatEntryValue = (value: number, recentMultiplier: number | undefined): string =>
  recentMultiplier === undefined ? `${value}` : `${value} (x${recentMultiplier})`

export const calculateWindowFillPercentage = (windowEntries: number, trackingWindowDays: number): number =>
  Math.round((windowEntries / trackingWindowDays) * 100)

// Geometric mean of the streak's own peak and the score target compresses the streak axis
// toward the target's scale without collapsing it to the target's (much smaller) magnitude,
// and the outer max() guarantees the axis never clips a streak that already exceeds the target.
export const calculateStreakAxisMax = (
  streakMax: number,
  targetScore: number | undefined,
): number | undefined => {
  if (targetScore === undefined || streakMax <= 0) return undefined
  return Math.max(streakMax, Math.sqrt(streakMax * targetScore))
}

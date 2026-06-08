export const formatChartDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const formatEntryValue = (value: number, recentMultiplier: number | undefined): string =>
  recentMultiplier === undefined ? `${value}` : `${value} (x${recentMultiplier})`

export const calculateWindowFillPercentage = (windowEntries: number, trackingWindowDays: number): number =>
  Math.round((windowEntries / trackingWindowDays) * 100)

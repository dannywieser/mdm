export const formatChangePercent = (changePercent: number): string => {
  const sign = changePercent > 0 ? "+" : ""
  return `${sign}${changePercent}%`
}

export const formatMonthLabel = (dateStr: string, timeZone: string): string =>
  new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone })

export const getChangeColor = (changePercent: number): string => {
  if (changePercent > 0) return "green.500"
  if (changePercent < 0) return "red.500"
  return "app.textMuted"
}

export const getMonthTicks = (notesPerDay: Array<{ date: string }>): string[] =>
  notesPerDay.filter(({ date }) => date.endsWith("-01")).map(({ date }) => date)

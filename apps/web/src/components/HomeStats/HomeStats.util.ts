export const formatChangePercent = (changePercent: number): string => {
  const sign = changePercent > 0 ? "+" : ""
  return `${sign}${changePercent}%`
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export const formatMonthLabel = (dateStr: string): string =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { month: "short" })

export const getChangeColor = (changePercent: number): string => {
  if (changePercent > 0) return "green.500"
  if (changePercent < 0) return "red.500"
  return "app.textMuted"
}

export const getMonthTicks = (notesPerDay: Array<{ date: string }>): string[] =>
  notesPerDay.filter(({ date }) => date.endsWith("-01")).map(({ date }) => date)

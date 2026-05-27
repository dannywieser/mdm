import type { DateComponents } from "./getDateComponents.types"

export const getDateComponents = (
  date: Date,
  timezone: string
): DateComponents => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: timezone,
    year: "numeric"
  })
  const parts = formatter.formatToParts(date)
  return {
    day: parseInt(parts.find((p) => p.type === "day")!.value, 10),
    month: parseInt(parts.find((p) => p.type === "month")!.value, 10),
    year: parseInt(parts.find((p) => p.type === "year")!.value, 10)
  }
}

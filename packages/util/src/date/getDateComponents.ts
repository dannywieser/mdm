import type { DateComponents } from "./getDateComponents.types"

/**
 * Returns the day, month, and year for a date in the provided IANA timezone.
 *
 * @param date Date instance to project into a calendar date.
 * @param timezone IANA timezone identifier used for calendar conversion.
 * @returns Calendar date components for the timezone-adjusted date.
 */
export const getDateComponents = (
  date: Date,
  timezone: string,
): DateComponents => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone: timezone,
    year: "numeric",
  })
  const parts = formatter.formatToParts(date)

  const findPart = (type: string): string =>
    parts.find((p) => p.type === type)?.value ?? "0"

  return {
    day: parseInt(findPart("day"), 10),
    month: parseInt(findPart("month"), 10),
    year: parseInt(findPart("year"), 10),
  }
}

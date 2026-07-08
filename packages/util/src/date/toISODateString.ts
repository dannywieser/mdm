import { getDateComponents } from "./getDateComponents"

/**
 * Formats a date as "YYYY-MM-DD" using the calendar date in the given IANA
 * timezone.
 *
 * @param date Date instance to format.
 * @param timezone IANA timezone identifier used for calendar conversion.
 * @returns The timezone-adjusted calendar date as an ISO "YYYY-MM-DD" string.
 */
export const toISODateString = (date: Date, timezone: string): string => {
  const { day, month, year } = getDateComponents(date, timezone)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

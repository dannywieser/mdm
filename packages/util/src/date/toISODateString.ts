import { getDateComponents } from "./getDateComponents"

/**
 * Formats a date as "YYYY-MM-DD" using the calendar date in the given IANA
 * timezone, or in the runtime's own timezone when none is given — which is
 * what a browser wants, since "today" there means the viewer's local day.
 *
 * @param date Date instance to format.
 * @param timezone IANA timezone identifier; defaults to the runtime's.
 * @returns The timezone-adjusted calendar date as an ISO "YYYY-MM-DD" string.
 */
export const toISODateString = (date: Date, timezone?: string): string => {
  const { day, month, year } = getDateComponents(
    date,
    timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  )
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

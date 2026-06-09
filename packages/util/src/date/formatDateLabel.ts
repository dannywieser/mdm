/**
 * Formats a "YYYY-MM-DD" date string as a short month+day label (e.g. "Jun 1").
 * Intended for chart axis labels and similar compact displays.
 *
 * @param dateStr Date string in "YYYY-MM-DD" format.
 * @param timeZone IANA timezone identifier (e.g. "America/Toronto").
 * @returns Formatted short date string.
 */
export const formatDateLabel = (dateStr: string, timeZone: string): string => {
  const date = new Date(`${dateStr}T00:00:00Z`)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone })
}

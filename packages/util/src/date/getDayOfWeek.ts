/**
 * Returns the day of the week for a "YYYY-MM-DD" date string.
 *
 * @param dateStr Date string in "YYYY-MM-DD" format.
 * @returns Day of week as 0 (Sunday) through 6 (Saturday).
 */
export const getDayOfWeek = (dateStr: string): number => {
  const date = new Date(dateStr + "T00:00:00Z")
  return date.getUTCDay()
}

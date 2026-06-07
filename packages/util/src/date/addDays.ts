/**
 * Adds (or, for negative values, subtracts) a number of days to a
 * "YYYY-MM-DD" date string, returning the result in the same format.
 *
 * @param dateStr Date string in "YYYY-MM-DD" format.
 * @param days Number of days to add; negative values subtract.
 * @returns The resulting date as a "YYYY-MM-DD" string.
 */
export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + "T00:00:00Z")
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Returns the number of whole days between two "YYYY-MM-DD" date strings,
 * positive when `toDate` is after `fromDate`.
 *
 * @param fromDate Start date string in "YYYY-MM-DD" format.
 * @param toDate End date string in "YYYY-MM-DD" format.
 * @returns The number of days from `fromDate` to `toDate`.
 */
export const daysBetween = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate + "T00:00:00Z")
  const to = new Date(toDate + "T00:00:00Z")
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

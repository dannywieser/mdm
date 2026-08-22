import { getMonthKey } from "./getMonthKey"

/**
 * Returns the number of whole calendar months between two "YYYY-MM-DD" date
 * strings, counting only the year/month components and ignoring the day, so
 * "2026-01-31" to "2026-02-01" is one month. Positive when `toDate` is in a
 * later month than `fromDate`.
 *
 * @param fromDate Start date string in "YYYY-MM-DD" format.
 * @param toDate End date string in "YYYY-MM-DD" format.
 * @returns The number of calendar months from `fromDate` to `toDate`.
 */
export const monthsBetween = (fromDate: string, toDate: string): number => {
  const [fromYear, fromMonth] = getMonthKey(fromDate).split("-").map(Number)
  const [toYear, toMonth] = getMonthKey(toDate).split("-").map(Number)
  return (toYear - fromYear) * 12 + (toMonth - fromMonth)
}

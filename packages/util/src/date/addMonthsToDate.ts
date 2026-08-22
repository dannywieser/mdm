import { addMonths } from "./addMonths"
import { getMonthEnd } from "./getMonthEnd"
import { getMonthKey } from "./getMonthKey"

/**
 * Adds (or, for negative values, subtracts) a number of months to a
 * "YYYY-MM-DD" date string, clamping the day to the last day of the
 * resulting month when the original day does not exist there (so adding one
 * month to "2026-01-31" yields "2026-02-28", not a rolled-over March date).
 *
 * @param dateStr Date string in "YYYY-MM-DD" format.
 * @param months Number of months to add; negative values subtract.
 * @returns The resulting date as a "YYYY-MM-DD" string.
 */
export const addMonthsToDate = (dateStr: string, months: number): string => {
  const targetMonthKey = addMonths(getMonthKey(dateStr), months)
  const monthEnd = getMonthEnd(targetMonthKey)
  const candidate = `${targetMonthKey}-${dateStr.slice(8, 10)}`
  return candidate > monthEnd ? monthEnd : candidate
}

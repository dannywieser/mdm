import { addMonths } from "./addMonths"

/**
 * Returns every "YYYY-MM" month key from `fromMonthKey` to `toMonthKey`,
 * inclusive, in ascending order.
 *
 * @param fromMonthKey Start month key in "YYYY-MM" format.
 * @param toMonthKey End month key in "YYYY-MM" format.
 * @returns Ascending array of month keys spanning the inclusive range.
 */
export const buildMonthRange = (fromMonthKey: string, toMonthKey: string): string[] => {
  const monthKeys: string[] = []
  for (let monthKey = fromMonthKey; monthKey <= toMonthKey; monthKey = addMonths(monthKey, 1)) {
    monthKeys.push(monthKey)
  }
  return monthKeys
}

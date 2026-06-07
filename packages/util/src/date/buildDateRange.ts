import { addDays } from "./addDays"

/**
 * Returns every "YYYY-MM-DD" date from `fromDate` to `toDate`, inclusive, in
 * ascending order.
 *
 * @param fromDate Start date string in "YYYY-MM-DD" format.
 * @param toDate End date string in "YYYY-MM-DD" format.
 * @returns Ascending array of date strings spanning the inclusive range.
 */
export const buildDateRange = (fromDate: string, toDate: string): string[] => {
  const dates: string[] = []
  for (let date = fromDate; date <= toDate; date = addDays(date, 1)) {
    dates.push(date)
  }
  return dates
}

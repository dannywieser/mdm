/**
 * Adds (or, for negative values, subtracts) a number of months to a
 * "YYYY-MM" month key, returning the result in the same format.
 *
 * @param monthKey Month string in "YYYY-MM" format.
 * @param months Number of months to add; negative values subtract.
 * @returns The resulting month as a "YYYY-MM" string.
 */
export const addMonths = (monthKey: string, months: number): string => {
  const [year, month] = monthKey.split("-").map(Number)
  const totalMonths = year * 12 + (month - 1) + months
  const resultYear = Math.floor(totalMonths / 12)
  const resultMonth = ((totalMonths % 12) + 12) % 12 + 1
  return `${resultYear}-${String(resultMonth).padStart(2, "0")}`
}

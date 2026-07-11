/**
 * Returns the last day of the month for a "YYYY-MM" month key.
 *
 * @param monthKey Month string in "YYYY-MM" format.
 * @returns The month's last day as a "YYYY-MM-DD" string.
 */
export const getMonthEnd = (monthKey: string): string => {
  const [year, month] = monthKey.split("-").map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  return `${monthKey}-${String(daysInMonth).padStart(2, "0")}`
}

/**
 * Returns the first day of the month for a "YYYY-MM" month key.
 *
 * @param monthKey Month string in "YYYY-MM" format.
 * @returns The month's first day as a "YYYY-MM-DD" string.
 */
export const getMonthStart = (monthKey: string): string => `${monthKey}-01`

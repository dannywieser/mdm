/**
 * Returns the "YYYY-MM" month key for a "YYYY-MM-DD" date string.
 *
 * @param dateStr Date string in "YYYY-MM-DD" format.
 * @returns The month key in "YYYY-MM" format.
 */
export const getMonthKey = (dateStr: string): string => dateStr.slice(0, 7)

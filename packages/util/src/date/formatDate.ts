import { format } from "date-fns/format"
/**
 * Formats a date given a specific format.
 *
 * @param date Date instance to format.
 * @returns Formatted date string.
 */
export const formatDate = (date: Date, fmt: string): string => {
  return format(date, fmt)
}

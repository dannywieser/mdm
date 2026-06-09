/**
 * Formats a date as "YYYY.MM.DD (ddd)" (e.g. "2026.06.01 (Mon)").
 *
 * @param date Date instance to format.
 * @returns Formatted date string.
 */
export const formatDate = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
  return `${year}.${month}.${day} (${weekday})`
}

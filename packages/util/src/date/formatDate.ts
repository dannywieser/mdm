/**
 * Formats a date as "YYYY.MM.DD (ddd)" (e.g. "2026.06.01 (Mon)").
 *
 * @param date Date instance to format.
 * @returns Formatted date string.
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  return `${year}.${month}.${day} (${weekday})`
}

/**
 * Formats a date as "YYYY.MM.DD (ddd)" (e.g. "2026.06.01 (Mon)").
 *
 * @param date Date instance to format.
 * @param timeZone IANA timezone identifier (e.g. "America/Toronto").
 * @returns Formatted date string.
 */
export const formatDate = (date: Date, timeZone: string): string => {
  const { year, month, day } = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value
      return acc
    }, {})
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone }).format(date)
  return `${year}.${month}.${day} (${weekday})`
}

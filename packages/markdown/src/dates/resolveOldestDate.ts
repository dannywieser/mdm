import { parseDateString } from "../parsers/parseDateString"

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/

const isIso8601 = (value: string): boolean =>
  ISO_DATE_PATTERN.test(value) || ISO_DATETIME_PATTERN.test(value)

const parseDateValue = (value: string, dateFormats: readonly string[]): Date | null => {
  const formatted = parseDateString(value, dateFormats)
  if (formatted) return formatted

  if (!isIso8601(value)) return null

  const isoDate = new Date(value)
  return isNaN(isoDate.getTime()) ? null : isoDate
}

/**
 * Resolves the oldest (earliest) date out of a list of date strings.
 *
 * Each value is first parsed against `dateFormats`, then as an ISO date
 * string, so the list can freely mix format-matched dates (e.g. dates
 * extracted from a title, body, or frontmatter) with ISO strings (e.g. a
 * file's modified date). Unparseable values are ignored.
 *
 * @param dates - Date strings to compare.
 * @param dateFormats - Format strings used to parse dates.
 * @returns The oldest resolved `Date`, or `null` if none could be parsed.
 */
export const resolveOldestDate = (
  dates: readonly string[],
  dateFormats: readonly string[],
): Date | null =>
  dates.reduce<Date | null>((oldest, value) => {
    const parsed = parseDateValue(value, dateFormats)
    if (!parsed) return oldest
    if (!oldest || parsed.getTime() < oldest.getTime()) return parsed
    return oldest
  }, null)

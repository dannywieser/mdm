import type { NoteFrontmatter } from "../types"

import { parseDateString } from "../parsers/parseDateString"
import { parseMarkdownBodyDates } from "../parsers/parseMarkdownBodyDates"

/**
 * Resolves a note's date from its frontmatter, falling back to a date
 * embedded in its title.
 *
 * The frontmatter value is first parsed against `dateFormats`, then as an
 * ISO date string. If neither succeeds (or the property is absent), the
 * first date found in `title` is used.
 *
 * @param frontmatter - Parsed note frontmatter, or `null`.
 * @param title - The note's title (typically its filename without extension).
 * @param frontmatterDateProperty - Frontmatter key to read the date from.
 * @param dateFormats - Format strings used to parse dates.
 * @returns The resolved `Date`, or `null` if no date could be determined.
 */
export const resolveDateFromFrontmatterOrTitle = (
  frontmatter: NoteFrontmatter | null,
  title: string,
  frontmatterDateProperty: string,
  dateFormats: readonly string[],
): Date | null => {
  const fmValue = frontmatter?.[frontmatterDateProperty]
  if (typeof fmValue === "string") {
    const fmFormatParsed = parseDateString(fmValue, dateFormats)
    if (fmFormatParsed) return fmFormatParsed
    const isoDate = new Date(fmValue)
    if (!isNaN(isoDate.getTime())) return isoDate
  }

  const titleDates = parseMarkdownBodyDates(title, dateFormats)
  if (titleDates.length > 0) {
    const parsed = parseDateString(titleDates[0] ?? "", dateFormats)
    if (parsed) return parsed
  }

  return null
}

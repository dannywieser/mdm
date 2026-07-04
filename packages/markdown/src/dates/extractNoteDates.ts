import { parseMarkdownBodyDates } from "../parsers/parseMarkdownBodyDates"

/**
 * Extracts every date found in a note's title and raw source text.
 *
 * `source` is the note's full file content, including any frontmatter
 * block, so this covers dates in the title, body, and frontmatter values
 * with a single pass — no need to parse frontmatter into an object first.
 * Title and source are joined with a newline (a non-digit separator, so
 * date matches never bleed across the boundary) and scanned once.
 *
 * @param title - The note's title.
 * @param source - The note's full raw file content (frontmatter block plus body).
 * @param dateFormats - Format strings used to find dates.
 * @returns Every matched date string, deduplicated, in the order first found.
 */
export const extractNoteDates = (
  title: string,
  source: string,
  dateFormats: readonly string[],
): string[] => {
  const text = [title, source].join("\n")
  return Array.from(new Set(parseMarkdownBodyDates(text, dateFormats)))
}

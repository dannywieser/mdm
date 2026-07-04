import type { NoteFrontmatter } from "../types"

import { parseMarkdownBodyDates } from "../parsers/parseMarkdownBodyDates"

/**
 * Extracts every date found in a note's title, body, and frontmatter values.
 *
 * The three sources are joined into a single block of text (separated by
 * newlines, so date matches never bleed across a source boundary) and
 * scanned once against `dateFormats`, so this is equivalent to extracting
 * dates from each source separately, but without the repeated parsing.
 *
 * @param title - The note's title.
 * @param body - The note's body text.
 * @param frontmatter - Parsed note frontmatter, or `null`.
 * @param dateFormats - Format strings used to find dates.
 * @returns Every matched date string, deduplicated, in the order first found (title, then body, then frontmatter).
 */
export const extractNoteDates = (
  title: string,
  body: string,
  frontmatter: NoteFrontmatter | null,
  dateFormats: readonly string[],
): string[] => {
  const frontmatterValues = frontmatter ? Object.values(frontmatter).flat() : []
  const text = [title, body, ...frontmatterValues].join("\n")
  return Array.from(new Set(parseMarkdownBodyDates(text, dateFormats)))
}

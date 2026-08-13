import type { ScannedNote } from "markdown"

import { resolveDateFromFrontmatterOrTitle } from "markdown"

import type { HabitEntry } from "./habit-detail.types"

import { logger } from "../../logger"

export const scanHabitEntriesFromNotes = (
  notes: readonly ScannedNote[],
  frontmatterProperty: string,
  createdDateProperty: string,
  dateFormats: readonly string[],
): HabitEntry[] =>
  notes
    .map((note) => buildHabitEntry(note, frontmatterProperty, createdDateProperty, dateFormats))
    .filter((entry): entry is HabitEntry => entry !== null)

const buildHabitEntry = (
  note: ScannedNote,
  frontmatterProperty: string,
  createdDateProperty: string,
  dateFormats: readonly string[],
): HabitEntry | null => {
  const { basename, frontmatter, obsidianUrl, title } = note

  const rawValue = frontmatter?.[frontmatterProperty]
  if (typeof rawValue !== "string") {
    logger.debug({ basename, frontmatterProperty, rawValue }, "[habit] skipping: property is not a string")
    return null
  }

  const cleanedValue = rawValue.replace(/^"(.*)"$/, "$1")
  if (!/^-?\d+(\.\d+)?$/.test(cleanedValue)) {
    logger.debug({ basename, frontmatterProperty, rawValue }, "[habit] skipping: property is not a numeric value")
    return null
  }

  const numValue = parseFloat(cleanedValue)
  if (numValue < 1) {
    logger.debug({ basename, frontmatterProperty, rawValue }, "[habit] skipping: value below minimum of 1")
    return null
  }

  const date = resolveDateFromFrontmatterOrTitle(frontmatter, title, createdDateProperty, dateFormats)
  if (!date) {
    logger.debug({
      basename,
      createdDateProperty,
      frontmatterCreatedValue: frontmatter?.[createdDateProperty],
    }, "[habit] skipping: unable to resolve a note date")
    return null
  }

  logger.debug({ basename, date, value: numValue }, "[habit] matched entry")
  return { date: date.toISOString().slice(0, 10), value: numValue, obsidianUrl }
}

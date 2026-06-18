import { buildObsidianUrl, parseFrontMatter, resolveDateFromFrontmatterOrTitle } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { HabitEntry } from "./habit-detail.types"

import { logger } from "../../logger"

const resolveNoteDate = (
  frontmatter: Record<string, string | string[]> | null,
  basename: string,
  createdDateProperty: string,
  deriveTitleDate: boolean,
  dateFormats: readonly string[],
): string | null => {
  const title = basename.replace(/\.[^.]+$/, "")
  const date = resolveDateFromFrontmatterOrTitle(frontmatter, title, createdDateProperty, deriveTitleDate, dateFormats)
  return date ? date.toISOString().slice(0, 10) : null
}

export const scanHabitEntries = async (
  filePaths: string[],
  frontmatterProperty: string,
  createdDateProperty: string,
  deriveTitleDate: boolean,
  dateFormats: readonly string[],
  notesDirectory: string,
  obsidianVault: string,
): Promise<HabitEntry[]> => {
  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      const basename = path.basename(filePath)
      const source = await fs.readFile(filePath, "utf8")
      const { frontmatter } = parseFrontMatter(source)
      if (!frontmatter) return null

      const rawValue = frontmatter[frontmatterProperty]
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
      if (numValue < 1 || numValue > 10) {
        logger.debug({ basename, frontmatterProperty, rawValue }, "[habit] skipping: value out of 1-10 range")
        return null
      }

      const date = resolveNoteDate(
        frontmatter,
        basename,
        createdDateProperty,
        deriveTitleDate,
        dateFormats,
      )
      if (!date) {
        logger.debug({
          basename,
          createdDateProperty,
          deriveTitleDate,
          frontmatterCreatedValue: frontmatter[createdDateProperty],
        }, "[habit] skipping: unable to resolve a note date")
        return null
      }

      logger.debug({ basename, date, value: numValue }, "[habit] matched entry")
      return { date, value: numValue, obsidianUrl: buildObsidianUrl(obsidianVault, notesDirectory, filePath) }
    }),
  )
  return results.filter((entry): entry is HabitEntry => entry !== null)
}

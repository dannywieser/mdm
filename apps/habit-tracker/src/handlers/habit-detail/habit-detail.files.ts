import { buildObsidianUrl, parseFrontMatter, resolveDateFromFrontmatterOrTitle } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { HabitEntry } from "./habit-detail.types"

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
      if (rawValue === undefined) return null

      if (typeof rawValue !== "string") {
        console.debug(`[habit] skipping ${basename}: "${frontmatterProperty}" is not a string`, { rawValue })
        return null
      }

      const cleanedValue = rawValue.replace(/^"(.*)"$/, "$1")
      if (!/^-?\d+(\.\d+)?$/.test(cleanedValue)) {
        console.debug(`[habit] skipping ${basename}: "${frontmatterProperty}" is not a numeric value`, { rawValue })
        return null
      }

      const numValue = parseFloat(cleanedValue)
      if (numValue < 1 || numValue > 10) {
        console.debug(`[habit] skipping ${basename}: "${frontmatterProperty}" value out of 1-10 range`, { rawValue })
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
        console.debug(`[habit] skipping ${basename}: unable to resolve a note date`, {
          createdDateProperty,
          deriveTitleDate,
          frontmatterCreatedValue: frontmatter[createdDateProperty],
        })
        return null
      }

      console.debug(`[habit] matched ${basename}`, { date, value: numValue })
      return { date, value: numValue, obsidianUrl: buildObsidianUrl(obsidianVault, notesDirectory, filePath) }
    }),
  )
  return results.filter((entry): entry is HabitEntry => entry !== null)
}

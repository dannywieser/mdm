import { parseDateString, parseFrontMatter, parseMarkdownBodyDates } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { HabitEntry } from "./habit-detail.types"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i

export const collectMarkdownFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) return collectMarkdownFiles(fullPath)
      if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) return [fullPath]
      return []
    }),
  )
  return nestedPaths.flat()
}

const buildObsidianUrl = (obsidianVault: string, notesDirectory: string, filePath: string): string => {
  const relativePath = path.relative(notesDirectory, filePath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const relativePathWithoutExtension = normalizedRelativePath.replace(/\.[^.]+$/, "")
  const escapedFilePath = relativePathWithoutExtension
    .split("/")
    .map((segment) => encodeURI(segment))
    .join("%2F")
  return `obsidian://open?vault=${encodeURIComponent(obsidianVault)}&file=${escapedFilePath}`
}

const resolveNoteDate = (
  frontmatter: Record<string, string | string[]> | null,
  basename: string,
  createdDateProperty: string,
  deriveTitleDate: boolean,
  dateFormats: readonly string[],
): string | null => {
  const fmValue = frontmatter?.[createdDateProperty]
  if (typeof fmValue === "string") {
    const fmParsed = parseDateString(fmValue, dateFormats)
    if (fmParsed) return fmParsed.toISOString().slice(0, 10)
    const isoDate = new Date(fmValue)
    if (!isNaN(isoDate.getTime())) return isoDate.toISOString().slice(0, 10)
  }
  if (deriveTitleDate) {
    const title = basename.replace(/\.[^.]+$/, "")
    const titleDates = parseMarkdownBodyDates(title, dateFormats)
    if (titleDates.length > 0) {
      const parsed = parseDateString(titleDates[0] ?? "", dateFormats)
      if (parsed) return parsed.toISOString().slice(0, 10)
    }
  }
  return null
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

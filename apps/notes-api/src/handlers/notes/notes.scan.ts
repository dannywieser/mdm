import { resolveNotesConfig } from "app-config"
import { buildObsidianUrl, extractNoteDates, parseFrontMatter, resolveOldestDate } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { ScannedNote } from "./notes.types"

import { resolveFrontmatterImages } from "./notes.parse"

export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export const resolveCreatedDate = (
  dates: readonly string[],
  dateFormats: readonly string[],
): string | null => {
  const date = resolveOldestDate(dates, dateFormats)
  return date ? date.toISOString() : null
}

export const scanMarkdownFile = async (
  filePath: string,
): Promise<ScannedNote> => {
  const { attachmentsDirectory, dateFormats, notesDirectory, obsidianVault } = await resolveNotesConfig()
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ])
  const { body, frontmatter } = parseFrontMatter(source)
  const basename = path.basename(filePath)
  const title = basename.endsWith(".md") ? basename.slice(0, -3) : basename
  const modifiedDate = stats.mtime.toISOString()
  const dates = Array.from(
    new Set([...extractNoteDates(title, body, frontmatter, dateFormats), modifiedDate]),
  )

  const obsidianUrl = buildObsidianUrl(obsidianVault, notesDirectory, filePath)
  const relativePath = path.relative(notesDirectory, filePath).split(path.sep).join("/")
  const resolvedFrontmatter = resolveFrontmatterImages(frontmatter, relativePath, attachmentsDirectory)

  return {
    basename,
    dates,
    createdDate: resolveCreatedDate(dates, dateFormats),
    folder: path.relative(notesDirectory, path.dirname(filePath)).split(path.sep).join("/"),
    frontmatter: resolvedFrontmatter,
    fullPath: filePath,
    fullText: body,
    id: createFileID(filePath, FILE_ID_NAMESPACE),
    modifiedDate,
    obsidianUrl,
    title,
  }
}

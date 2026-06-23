import { resolveNotesConfig } from "app-config"
import {
  buildObsidianUrl,
  getTitleFromFilePath,
  parseFrontMatter,
  parseMarkdownBodyDates,
} from "markdown"
import {
  createFileID,
  getFolderFromFilePath,
  readFile,
  getBasename,
  formatDate,
} from "mdm-util"

import type { ScannedNote } from "./notes.types"

export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export async function scanMarkdownFile(filePath: string): Promise<ScannedNote> {
  const { notesDirectory, dateFormats, obsidianVault } =
    await resolveNotesConfig()

  const basename = getBasename(filePath)
  const id = createFileID(filePath, FILE_ID_NAMESPACE)
  const folder = getFolderFromFilePath(notesDirectory, filePath)
  const title = getTitleFromFilePath(filePath)

  const { source, stats } = await readFile(filePath)
  const modifiedDate = formatDate(stats.mtime, dateFormats[0]) // Use the first date format for modifiedDate

  const dates = parseMarkdownBodyDates(`${title} ${source}`, dateFormats)
  const { body: fullText, frontmatter } = parseFrontMatter(source)
  const createdDate = (frontmatter?.created as string | undefined) ?? dates[0]
  const obsidianUrl = buildObsidianUrl(obsidianVault, notesDirectory, filePath)

  return {
    basename,
    createdDate,
    folder,
    frontmatter,
    fullText,
    id,
    modifiedDate,
    title,
    obsidianUrl,
    dates,
  }
}

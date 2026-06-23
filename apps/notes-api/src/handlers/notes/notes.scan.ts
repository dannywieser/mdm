import { resolveNotesConfig } from "app-config"
import {
  buildObsidianUrl,
  getTitleFromFilePath,
  parseFrontMatter,
  parseMarkdownBodyDates,
} from "markdown"
import {
  createFileID,
  format,
  getFolderFromFilePath,
  readFile,
  getBasename,
  formatDate,
} from "mdm-util"

import type { ScannedNote } from "./notes.types"

// import { resolveFrontmatterImages } from "./notes.parse"

export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

// const extractFrontmatterDates = (
//   frontmatter: NoteFrontmatter,
//   dateFormats: readonly string[],
// ): string[] =>
//   Object.values(frontmatter)
//     .flat()
//     .flatMap((value) => parseMarkdownBodyDates(value, dateFormats))

export async function scanMarkdownFile(filePath: string): Promise<ScannedNote> {
  const { notesDirectory, dateFormats, obsidianVault } =
    await resolveNotesConfig()

  const basename = getBasename(filePath)
  const id = createFileID(filePath, FILE_ID_NAMESPACE)
  const folder = getFolderFromFilePath(notesDirectory, filePath)
  const title = getTitleFromFilePath(filePath)

  const { source, stats } = await readFile(filePath)
  const modifiedDate = formatDate(stats.mtime, dateFormats[0]) // Use the first date format for modifiedDate

  const dates = parseMarkdownBodyDates(source, ["YYYY.MM.DD"])
  const { body, frontmatter } = parseFrontMatter(source)
  const obsidianUrl = buildObsidianUrl(obsidianVault, notesDirectory, filePath)

  return {
    basename,
    folder,
    frontmatter,
    id,
    modifiedDate,
    title,
    obsidianUrl,
    dates,
  } as unknown as ScannedNote

  // const titleOrBodyDates = Array.from(
  //   new Set([
  //     ...parseMarkdownBodyDates(title, dateFormats),
  //     ...parseMarkdownBodyDates(body, dateFormats),
  //     ...(frontmatter ? extractFrontmatterDates(frontmatter, dateFormats) : []),
  //   ]),
  // )

  // const relativePath = path
  //   .relative(notesDirectory, filePath)
  //   .split(path.sep)
  //   .join("/")
  // const resolvedFrontmatter = resolveFrontmatterImages(
  //   frontmatter,
  //   relativePath,
  //   attachmentsDirectory,
  // )
}

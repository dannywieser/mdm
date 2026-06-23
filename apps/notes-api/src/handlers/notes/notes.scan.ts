import { resolveNotesConfig } from "app-config"
import { getTitleFromFilePath } from "markdown"
import {
  createFileID,
  format,
  getFolderFromFilePath,
  readFile,
  getBasename,
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
  const { notesDirectory, dateFormats } = await resolveNotesConfig()

  const basename = getBasename(filePath)
  const id = createFileID(filePath, FILE_ID_NAMESPACE)
  const folder = getFolderFromFilePath(notesDirectory, filePath)
  const title = getTitleFromFilePath(filePath)

  const { source, stats } = await readFile(filePath)
  const modifiedDate = format(stats.mtime, dateFormats[0]) // Use the first date format for modifiedDate

  return {
    basename,
    folder,
    id,
    modifiedDate,
    title,
  } as unknown as ScannedNote

  // const { body, frontmatter } = parseFrontMatter(source)

  // const titleOrBodyDates = Array.from(
  //   new Set([
  //     ...parseMarkdownBodyDates(title, dateFormats),
  //     ...parseMarkdownBodyDates(body, dateFormats),
  //     ...(frontmatter ? extractFrontmatterDates(frontmatter, dateFormats) : []),
  //   ]),
  // )

  // const obsidianUrl = buildObsidianUrl(obsidianVault, notesDirectory, filePath)
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

import type { NoteFrontmatter } from "markdown"

import { parseFrontMatter, parseMarkdownBodyDates } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { ScannedNote } from "./notes.types"

export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export const resolveCreatedDate = (
  frontmatter: NoteFrontmatter | null,
  birthtime: Date,
): string => {
  const created = frontmatter?.["created"]
  if (typeof created === "string") {
    const parsed = new Date(created)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }
  return birthtime.toISOString()
}

const extractFrontmatterDates = (
  frontmatter: NoteFrontmatter,
  dateFormats: readonly string[],
): string[] =>
  Object.values(frontmatter)
    .flat()
    .flatMap((value) => parseMarkdownBodyDates(value, dateFormats))

export const scanMarkdownFile = async (
  filePath: string,
  notesDirectory: string,
  obsidianVault: string,
  dateFormats: readonly string[] = [],
): Promise<ScannedNote> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ])
  const { body, frontmatter } = parseFrontMatter(source)
  const basename = path.basename(filePath)
  const title = basename.endsWith(".md") ? basename.slice(0, -3) : basename
  const titleOrBodyDates = Array.from(
    new Set([
      ...parseMarkdownBodyDates(title, dateFormats),
      ...parseMarkdownBodyDates(body, dateFormats),
      ...(frontmatter ? extractFrontmatterDates(frontmatter, dateFormats) : []),
    ]),
  )

  const relativePath = path.relative(notesDirectory, filePath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const relativePathWithoutExtension = normalizedRelativePath.replace(/\.[^.]+$/, "")
  const escapedFilePath = relativePathWithoutExtension
    .split("/")
    .map((segment) => encodeURI(segment))
    .join("%2F")
  const obsidianUrl = `obsidian://open?vault=${encodeURIComponent(obsidianVault)}&file=${escapedFilePath}`

  return {
    basename,
    titleOrBodyDates,
    createdDate: resolveCreatedDate(frontmatter, stats.birthtime),
    folder: path.relative(notesDirectory, path.dirname(filePath)).split(path.sep).join("/"),
    frontmatter,
    fullPath: filePath,
    id: createFileID(filePath, FILE_ID_NAMESPACE),
    modifiedDate: stats.mtime.toISOString(),
    obsidianUrl,
    title,
  }
}

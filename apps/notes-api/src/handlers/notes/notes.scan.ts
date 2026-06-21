import type { NoteFrontmatter } from "markdown"

import { buildObsidianUrl, parseFrontMatter, parseMarkdownBodyDates, resolveDateFromFrontmatterOrTitle } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { ScannedNote } from "./notes.types"

import { resolveFrontmatterImages } from "./notes.parse"

export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export const resolveCreatedDate = (
  frontmatter: NoteFrontmatter | null,
  title: string,
  createdDateProperty: string,
  dateFormats: readonly string[],
): string | null => {
  const date = resolveDateFromFrontmatterOrTitle(frontmatter, title, createdDateProperty, dateFormats)
  return date ? date.toISOString() : null
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
  createdDateProperty = "created",
  attachmentsDirectory = "",
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

  const obsidianUrl = buildObsidianUrl(obsidianVault, notesDirectory, filePath)
  const relativePath = path.relative(notesDirectory, filePath).split(path.sep).join("/")
  const resolvedFrontmatter = resolveFrontmatterImages(frontmatter, relativePath, attachmentsDirectory)

  return {
    basename,
    titleOrBodyDates,
    createdDate: resolveCreatedDate(frontmatter, title, createdDateProperty, dateFormats),
    folder: path.relative(notesDirectory, path.dirname(filePath)).split(path.sep).join("/"),
    frontmatter: resolvedFrontmatter,
    fullPath: filePath,
    fullText: body,
    id: createFileID(filePath, FILE_ID_NAMESPACE),
    modifiedDate: stats.mtime.toISOString(),
    obsidianUrl,
    title,
  }
}

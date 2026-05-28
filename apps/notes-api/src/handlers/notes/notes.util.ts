import { parseFrontMatter, parseMarkdownBodyDates, type Note } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

import type { MarkdownNode } from "./notes.util.types"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i
const IMAGE_SERVER_PATH = "/images"
const EXTERNAL_IMAGE_URL_PATTERN = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/|#)/
export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export const collectMarkdownFiles = async (
  directory: string,
): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nestedPaths = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath)
      }

      if (entry.isFile() && MARKDOWN_FILE_PATTERN.test(entry.name)) {
        return [fullPath]
      }

      return []
    }),
  )

  return nestedPaths.flat()
}

export const parseMarkdownFile = async (
  filePath: string,
  notesDirectory: string,
  obsidianVault: string,
  dateFormats: readonly string[] = [],
  attachmentsDirectory: string = "attachments",
): Promise<Note> => {
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
    ]),
  )

  const relativePath = path.relative(notesDirectory, filePath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const markdownBody = rewriteMarkdownImageUrls(body, normalizedRelativePath, attachmentsDirectory)
  const html = await remark().use(remarkHtml).process(markdownBody)
  const relativePathWithoutExtension = normalizedRelativePath.replace(
    /\.[^.]+$/,
    "",
  )
  const escapedFilePath = relativePathWithoutExtension
    .split("/")
    .map((segment) => encodeURI(segment))
    .join("%2F")
  const obsidianUrl = `obsidian://open?vault=${encodeURIComponent(obsidianVault)}&file=${escapedFilePath}`

  return {
    createdDate: stats.birthtime.toISOString(),
    titleOrBodyDates,
    frontmatter,
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: createFileID(filePath, FILE_ID_NAMESPACE),
    folder: path.basename(path.dirname(filePath)),
    html: String(html),
    title,
    obsidianUrl,
  }
}

const rewriteMarkdownImageUrls = (
  markdownBody: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): string => {
  const markdownTree = remark().parse(markdownBody)

  visitMarkdownTree(markdownTree, (node) => {
    if (node.type !== "image" || typeof node.url !== "string") {
      return
    }

    const imagePath = resolveLocalImagePath(node.url, noteRelativePath, attachmentsDirectory)

    if (!imagePath) {
      return
    }

    node.url = `${IMAGE_SERVER_PATH}?path=${encodeURIComponent(imagePath)}`
  })

  return String(remark().stringify(markdownTree))
}

const resolveLocalImagePath = (
  rawImagePath: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): string | null => {
  const sanitizedImagePath = rawImagePath.trim()

  if (
    !sanitizedImagePath ||
    EXTERNAL_IMAGE_URL_PATTERN.test(sanitizedImagePath)
  ) {
    return null
  }

  const baseImagePath = sanitizedImagePath.split(/[?#]/)[0] ?? ""

  if (!baseImagePath) {
    return null
  }

  const decodedImagePath = safeDecodeURIComponent(baseImagePath)

  if (!decodedImagePath.includes("/")) {
    const noteDir = path.posix.dirname(noteRelativePath)
    const noteStem = path.posix.basename(noteRelativePath).replace(/\.[^.]+$/, "")
    const attachmentSubPath =
      noteDir === "."
        ? path.posix.join(attachmentsDirectory, noteStem, decodedImagePath)
        : path.posix.join(attachmentsDirectory, noteDir, noteStem, decodedImagePath)

    return attachmentSubPath
  }

  const normalizedImagePath = path.posix.normalize(
    decodedImagePath.startsWith("/")
      ? decodedImagePath.replace(/^\/+/, "")
      : path.posix.join(path.posix.dirname(noteRelativePath), decodedImagePath),
  )

  if (
    normalizedImagePath === "" ||
    normalizedImagePath === "." ||
    normalizedImagePath === ".." ||
    normalizedImagePath.startsWith("../")
  ) {
    return null
  }

  return normalizedImagePath
}

const visitMarkdownTree = (
  node: MarkdownNode | undefined,
  visitor: (node: MarkdownNode) => void,
): void => {
  if (!node) {
    return
  }

  visitor(node)

  if (!Array.isArray(node.children)) {
    return
  }

  node.children.forEach((childNode) => visitMarkdownTree(childNode, visitor))
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

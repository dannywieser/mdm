import type { MarkdownNode, Note, NoteFrontmatter } from "markdown"

import { parseFrontMatter } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkGfm from "remark-gfm"

import type { ScannedNote, WikilinkReplacement } from "./notes.types"

import {
  normalizeObsidianWikiEmbeds,
  resolveWikilinks,
  WIKILINK_PLACEHOLDER_PATTERN,
} from "./notes.wikilinks"

const IMAGE_SERVER_PATH = "/images"
const EXTERNAL_IMAGE_URL_PATTERN = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/|#)/

export const EMPTY_MARKDOWN_NODE: MarkdownNode = { type: "root", children: [] }

export const parseMarkdownFile = async (
  note: ScannedNote,
  notesDirectory: string,
  attachmentsDirectory = "attachments",
  allNotes: ScannedNote[] = [],
): Promise<Note> => {
  const source = await fs.readFile(note.fullPath, "utf8")
  const { body } = parseFrontMatter(source)
  const relativePath = path.relative(notesDirectory, note.fullPath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")

  const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(body, allNotes)

  const content = buildMarkdownTree(
    processedBody,
    normalizedRelativePath,
    attachmentsDirectory,
    replacements,
  )

  const linkedNotes = await Promise.all(
    linkedNoteRefs.map((linkedNote) =>
      parseMarkdownFile(linkedNote, notesDirectory, attachmentsDirectory, []),
    ),
  )

  return {
    ...note,
    content,
    linkedNotes,
  }
}

export const resolveFrontmatterImages = (
  frontmatter: NoteFrontmatter | null,
  noteRelativePath: string,
  attachmentsDirectory: string,
): NoteFrontmatter | null => {
  if (!frontmatter) return null

  const cover = frontmatter.cover
  if (!cover) return frontmatter

  const rawPath = Array.isArray(cover) ? cover[0] : cover
  if (!rawPath) return frontmatter

  if (rawPath.startsWith(`${attachmentsDirectory}/`)) return frontmatter

  const resolvedPath = resolveLocalImagePath(rawPath, noteRelativePath, attachmentsDirectory)
  if (!resolvedPath) return frontmatter

  return { ...frontmatter, cover: resolvedPath }
}

const buildMarkdownTree = (
  markdownBody: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
  replacements: WikilinkReplacement[],
): MarkdownNode => {
  const normalizedBody = normalizeObsidianWikiEmbeds(markdownBody)
  const parsedTree = remark().use(remarkGfm).parse(normalizedBody)

  if (!isMarkdownNode(parsedTree)) {
    throw new Error("Unable to parse markdown into a valid node tree")
  }

  const markdownTree = parsedTree

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

  applyWikilinkReplacementsToMarkdownTree(markdownTree, replacements)

  return markdownTree
}

const applyWikilinkReplacementsToMarkdownTree = (
  tree: MarkdownNode,
  replacements: WikilinkReplacement[],
): void => {
  visitMarkdownTree(tree, (node) => {
    if (!Array.isArray(node.children) || node.children.length === 0) {
      return
    }

    node.children = node.children.flatMap((childNode) =>
      replaceWikilinkPlaceholdersInNode(childNode, replacements),
    )
  })
}

const replaceWikilinkPlaceholdersInNode = (
  node: MarkdownNode,
  replacements: WikilinkReplacement[],
): MarkdownNode[] => {
  if (node.type !== "text" || typeof node.value !== "string") {
    return [node]
  }

  const parts: MarkdownNode[] = []
  let cursor = 0

  for (const match of node.value.matchAll(WIKILINK_PLACEHOLDER_PATTERN)) {
    const matchedText = match[0]
    const start = match.index
    const end = start + matchedText.length
    const index = Number.parseInt(match[1], 10)
    const replacement = replacements.at(index)

    if (replacement === undefined) {
      continue
    }

    if (start > cursor) {
      parts.push({
        type: "text",
        value: node.value.slice(cursor, start),
      })
    }

    const { displayText, matchedNote } = replacement

    if (matchedNote) {
      parts.push({
        type: "link",
        url: matchedNote.obsidianUrl,
        children: [{ type: "text", value: displayText }],
      })
    } else {
      parts.push({
        type: "text",
        value: displayText,
        wikilinkType: "unmatched",
      })
    }

    cursor = end
  }

  if (parts.length === 0) {
    return [node]
  }

  if (cursor < node.value.length) {
    parts.push({
      type: "text",
      value: node.value.slice(cursor),
    })
  }

  return parts
}

const resolveLocalImagePath = (
  rawImagePath: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): string | null => {
  const sanitizedImagePath = rawImagePath.trim()

  if (!sanitizedImagePath || EXTERNAL_IMAGE_URL_PATTERN.test(sanitizedImagePath)) {
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

  node.children.forEach((childNode) => { visitMarkdownTree(childNode, visitor); })
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const isMarkdownNode = (value: unknown): value is MarkdownNode => {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as { children?: unknown; type?: unknown }

  if (typeof candidate.type !== "string") {
    return false
  }

  if (candidate.children === undefined) {
    return true
  }

  if (!Array.isArray(candidate.children)) {
    return false
  }

  return candidate.children.every((childNode) => isMarkdownNode(childNode))
}

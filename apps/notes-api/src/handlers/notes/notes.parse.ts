import type { MarkdownNode, Note, NoteFrontmatter } from "markdown"

import { resolveNotesConfig } from "app-config"
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
  allNotes: ScannedNote[] = [],
): Promise<Note> => {
  return allNotes
  // const { attachmentsDirectory, notesDirectory } = await resolveNotesConfig()
  // const relativePath = path.relative(notesDirectory, note.fullPath)
  // const normalizedRelativePath = relativePath.split(path.sep).join("/")

  // const content = buildMarkdownTree(
  //   processedBody,
  //   normalizedRelativePath,
  //   replacements,
  //   attachmentsDirectory,
  // )

  // const linkedNotes = await Promise.all(
  //   linkedNoteRefs.map((linkedNote) => parseMarkdownFile(linkedNote, [])),
  // )

  // return {
  //   ...note,
  //   content,
  //   linkedNotes,
  // }
}

const buildMarkdownTree = (
  markdownBody: string,
  noteRelativePath: string,
  replacements: WikilinkReplacement[],
  attachmentsDirectory = "",
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

    const imagePath = resolveLocalImagePath(
      node.url,
      noteRelativePath,
      attachmentsDirectory,
    )

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

const resolveMultiComponentImagePath = (
  decodedImagePath: string,
  noteRelativePath: string,
): string => {
  if (decodedImagePath.startsWith("/")) {
    return decodedImagePath.replace(/^\/+/, "")
  }
  if (decodedImagePath.startsWith("./") || decodedImagePath.startsWith("../")) {
    return path.posix.join(
      path.posix.dirname(noteRelativePath),
      decodedImagePath,
    )
  }
  return decodedImagePath
}

const resolveLocalImagePath = (
  rawImagePath: string,
  noteRelativePath: string,
  attachmentsDirectory = "",
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
    const noteStem = path.posix
      .basename(noteRelativePath)
      .replace(/\.[^.]+$/, "")
    const parts: string[] = []
    if (attachmentsDirectory) parts.push(attachmentsDirectory)
    if (noteDir !== ".") parts.push(noteDir)
    parts.push(noteStem, decodedImagePath)
    return path.posix.join(...parts)
  }

  const resolvedImagePath = resolveMultiComponentImagePath(
    decodedImagePath,
    noteRelativePath,
  )
  const normalizedImagePath = path.posix.normalize(resolvedImagePath)

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

  node.children.forEach((childNode) => {
    visitMarkdownTree(childNode, visitor)
  })
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

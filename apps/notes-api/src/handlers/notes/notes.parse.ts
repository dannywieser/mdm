import type { Note } from "markdown"

import { parseFrontMatter } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

import type { MarkdownNode, ScannedNote } from "./notes.types"

const IMAGE_SERVER_PATH = "/images"
const EXTERNAL_IMAGE_URL_PATTERN = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/|#)/
const OBSIDIAN_WIKILINK_EMBED_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/g
const WIKILINK_PATTERN = /(?<!!)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g
const WIKILINK_PLACEHOLDER_PATTERN = /WLPH(\d+)ENDWL/g

interface WikilinkReplacement {
  displayText: string
  matchedNote: ScannedNote | null
}

export const parseMarkdownFile = async (
  note: ScannedNote,
  notesDirectory: string,
  attachmentsDirectory: string = "attachments",
  allNotes: ScannedNote[] = [],
): Promise<Note> => {
  const source = await fs.readFile(note.fullPath, "utf8")
  const { body } = parseFrontMatter(source)
  const relativePath = path.relative(notesDirectory, note.fullPath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")

  const { processedBody, linkedNoteRefs, replacements } = resolveWikilinks(body, allNotes)

  const markdownBody = rewriteMarkdownImageUrls(
    processedBody,
    normalizedRelativePath,
    attachmentsDirectory,
  )
  const rawHtml = await remark().use(remarkHtml).process(markdownBody)
  const html = applyWikilinkReplacements(String(rawHtml), replacements)

  const linkedNotes = await Promise.all(
    linkedNoteRefs.map((linkedNote) =>
      parseMarkdownFile(linkedNote, notesDirectory, attachmentsDirectory, []),
    ),
  )

  return {
    ...note,
    html,
    linkedNotes,
  }
}

const resolveWikilinks = (
  body: string,
  allNotes: ScannedNote[],
): { processedBody: string; linkedNoteRefs: ScannedNote[]; replacements: WikilinkReplacement[] } => {
  const linkedNoteRefs: ScannedNote[] = []
  const replacements: WikilinkReplacement[] = []

  const processedBody = body.replace(
    WIKILINK_PATTERN,
    (_, noteRef: string, alias: string | undefined) => {
      const noteName = noteRef.trim()
      const displayText = alias?.trim() || noteName
      const matchedNote =
        allNotes.find((n) => n.title.toLowerCase() === noteName.toLowerCase()) ?? null

      if (matchedNote && !linkedNoteRefs.some((n) => n.id === matchedNote.id)) {
        linkedNoteRefs.push(matchedNote)
      }

      const index = replacements.length
      replacements.push({ displayText, matchedNote })
      return `WLPH${index}ENDWL`
    },
  )

  return { processedBody, linkedNoteRefs, replacements }
}

const applyWikilinkReplacements = (
  html: string,
  replacements: WikilinkReplacement[],
): string =>
  html.replace(WIKILINK_PLACEHOLDER_PATTERN, (_, indexStr: string) => {
    const replacement = replacements[parseInt(indexStr, 10)]

    if (!replacement) {
      return ""
    }

    const { displayText, matchedNote } = replacement
    const escaped = escapeHtml(displayText)

    if (matchedNote) {
      return `<a href="${matchedNote.obsidianUrl}">${escaped}</a>`
    }

    return `<span class="wikilink-unmatched">${escaped}</span>`
  })

const rewriteMarkdownImageUrls = (
  markdownBody: string,
  noteRelativePath: string,
  attachmentsDirectory: string,
): string => {
  const normalizedBody = normalizeObsidianWikiEmbeds(markdownBody)
  const markdownTree = remark().parse(normalizedBody)

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

const normalizeObsidianWikiEmbeds = (markdownBody: string): string =>
  markdownBody.replace(OBSIDIAN_WIKILINK_EMBED_PATTERN, "![]($1)")

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

  node.children.forEach((childNode) => visitMarkdownTree(childNode, visitor))
}

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
}

const escapeHtml = (text: string): string =>
  text.replace(/[&<>"]/g, (char) => HTML_ESCAPE_MAP[char] ?? char)

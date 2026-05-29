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

const TASK_LIST_ICON_SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'

const CHECKED_ICON = `<svg ${TASK_LIST_ICON_SVG_ATTRS} class="task-list-icon task-list-icon--checked"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`
const UNCHECKED_ICON = `<svg ${TASK_LIST_ICON_SVG_ATTRS} class="task-list-icon task-list-icon--unchecked"><path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/></svg>`

export const processTaskListHtml = (html: string): string =>
  html.replace(/<input\s+[^>]*type="checkbox"[^>]*>/gi, (match) =>
    /\bchecked\b/i.test(match) ? CHECKED_ICON : UNCHECKED_ICON,
  )

export const parseMarkdownFile = async (
  note: ScannedNote,
  notesDirectory: string,
  attachmentsDirectory: string = "attachments",
): Promise<Note> => {
  const source = await fs.readFile(note.fullPath, "utf8")
  const { body } = parseFrontMatter(source)
  const relativePath = path.relative(notesDirectory, note.fullPath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const markdownBody = rewriteMarkdownImageUrls(
    body,
    normalizedRelativePath,
    attachmentsDirectory,
  )
  const html = await remark().use(remarkHtml).process(markdownBody)

  return {
    ...note,
    html: processTaskListHtml(String(html)),
  }
}

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

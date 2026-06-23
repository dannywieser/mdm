import type { ScannedNote, WikilinkReplacement } from "./notes.types"

import { WIKILINK_PLACEHOLDER_PATTERN } from "markdown"

// eslint-disable-next-line sonarjs/slow-regex -- pattern is bounded by wikilink delimiters; not user-controlled input
const WIKILINK_PATTERN = /(?<!!)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char)

export const resolveWikilinks = (
  body: string,
  allNotes: ScannedNote[],
): { processedBody: string; linkedNoteRefs: ScannedNote[]; replacements: WikilinkReplacement[] } => {
  const linkedNoteRefs: ScannedNote[] = []
  const replacements: WikilinkReplacement[] = []

  const processedBody = body.replace(
    WIKILINK_PATTERN,
    (_, noteRef: string, alias: string | undefined) => {
      const noteName = noteRef.trim()
      const displayText = (alias?.trim() ?? "") || noteName
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

export const applyWikilinkReplacements = (
  html: string,
  replacements: WikilinkReplacement[],
): string =>
  html.replace(WIKILINK_PLACEHOLDER_PATTERN, (_, indexStr: string) => {
    const replacement = replacements.at(parseInt(indexStr, 10))

    if (replacement === undefined) {
      return ""
    }

    const { displayText, matchedNote } = replacement
    const escaped = escapeHtml(displayText)

    if (matchedNote) {
      return `<a href="${matchedNote.obsidianUrl}">${escaped}</a>`
    }

    return `<span class="wikilink-unmatched">${escaped}</span>`
  })

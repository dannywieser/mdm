import type { ScannedNote, WikilinkReplacement } from "./notes.types"

export const WIKILINK_PLACEHOLDER_PATTERN = /WLPH(\d+)ENDWL/g

const WIKILINK_PATTERN = /(?<!!)\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g
export const OBSIDIAN_WIKILINK_EMBED_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/g

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export const escapeHtml = (text: string): string =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] ?? char)

export const normalizeObsidianWikiEmbeds = (markdownBody: string): string =>
  markdownBody.replace(OBSIDIAN_WIKILINK_EMBED_PATTERN, "![]($1)")

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

export const applyWikilinkReplacements = (
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

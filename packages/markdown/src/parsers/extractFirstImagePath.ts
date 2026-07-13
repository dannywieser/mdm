const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)]+)\)/
const WIKILINK_IMAGE_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/

interface ImageCandidate {
  index: number
  path: string
}

const stripImageTitle = (rawUrl: string): string => {
  const trimmed = rawUrl.trim()
  const titleMatch = /^(\S+)\s+["'].*["']$/.exec(trimmed)
  const path = titleMatch ? titleMatch[1] : trimmed
  return path.replace(/^<|>$/g, "")
}

const findFirstMatch = (
  text: string,
  pattern: RegExp,
  toPath: (match: RegExpExecArray) => string,
): ImageCandidate | null => {
  const match = pattern.exec(text)
  if (!match) return null
  return { index: match.index, path: toPath(match) }
}

// Parses raw markdown text (not the parsed node tree) so a fallback cover image
// can be found even for notes whose frontmatter has no explicit cover value.
export const extractFirstImagePath = (markdownText: string): string | null => {
  const candidates = [
    findFirstMatch(markdownText, MARKDOWN_IMAGE_PATTERN, (match) => stripImageTitle(match[1])),
    findFirstMatch(markdownText, WIKILINK_IMAGE_PATTERN, (match) => match[1].trim()),
  ].filter((candidate): candidate is ImageCandidate => candidate !== null && candidate.path !== "")

  if (candidates.length === 0) return null

  candidates.sort((a, b) => a.index - b.index)
  return candidates[0].path
}

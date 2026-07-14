const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g
const WIKILINK_IMAGE_PATTERN = /!\[\[([^\]|]+)(?:\|[^\]]*)?]]/g

interface ImageMatch {
  index: number
  path: string
}

// A markdown image destination is either `<...>` (may contain spaces, ends at the first `>`)
// or a bare token (ends at the first whitespace, which then starts an optional "title").
const parseImageDestination = (rawDestination: string): string => {
  const trimmed = rawDestination.trim()

  if (trimmed.startsWith("<")) {
    const closingIndex = trimmed.indexOf(">")
    return closingIndex === -1 ? trimmed.slice(1) : trimmed.slice(1, closingIndex)
  }

  const [bareDestination] = trimmed.split(/\s+/)
  return bareDestination
}

const collectMatches = (
  text: string,
  pattern: RegExp,
  toPath: (match: RegExpMatchArray) => string,
): ImageMatch[] => {
  const matches: ImageMatch[] = []

  for (const match of text.matchAll(pattern)) {
    matches.push({ index: match.index, path: toPath(match) })
  }

  return matches
}

// Parses raw markdown text (not the parsed node tree) so a note's cover images can be
// found even when the note has no explicit cover-related frontmatter.
export const extractImagePaths = (markdownText: string): string[] => {
  const matches = [
    ...collectMatches(markdownText, MARKDOWN_IMAGE_PATTERN, (match) => parseImageDestination(match[1])),
    ...collectMatches(markdownText, WIKILINK_IMAGE_PATTERN, (match) => match[1].trim()),
  ].sort((a, b) => a.index - b.index)

  const seenPaths = new Set<string>()
  const paths: string[] = []

  for (const { path } of matches) {
    if (path === "" || seenPaths.has(path)) continue
    seenPaths.add(path)
    paths.push(path)
  }

  return paths
}

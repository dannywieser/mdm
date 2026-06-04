import type { NoteFrontmatter, ParsedFrontMatter } from "../types"

const FRONTMATTER_DELIMITER = "---"

// Matches [[path]] and [[path|alias]], with or without surrounding double quotes
const WIKILINK_RE = /^"?\[\[([^\]|]+)(?:\|[^\]]*)?]]"?$/

export const resolveObsidianFrontmatterValue = (value: string): string => {
  const match = WIKILINK_RE.exec(value)
  return match ? match[1].trim() : value
}

export const parseFrontMatter = (source: string): ParsedFrontMatter => {
  const lines = source.split(/\r?\n/)

  if (lines[0] !== FRONTMATTER_DELIMITER) {
    return { body: source, frontmatter: null }
  }

  const closingDelimiterIndex = lines.findIndex(
    (line, index) => index > 0 && line === FRONTMATTER_DELIMITER
  )

  if (closingDelimiterIndex === -1) {
    return { body: source, frontmatter: null }
  }

  const frontmatterLines = lines.slice(1, closingDelimiterIndex)
  const body = lines.slice(closingDelimiterIndex + 1).join("\n")

  return {
    body,
    frontmatter: toFrontmatter(frontmatterLines)
  }
}

const toFrontmatter = (lines: string[]): NoteFrontmatter => {
  const frontmatter: NoteFrontmatter = {}
  let currentArrayKey: string | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      continue
    }

    if (currentArrayKey && trimmedLine.startsWith("-")) {
      frontmatter[currentArrayKey] = [
        ...(frontmatter[currentArrayKey] as string[]),
        resolveObsidianFrontmatterValue(trimmedLine.replace(/^-\s*/, ""))
      ]
      continue
    }

    const separatorIndex = line.indexOf(":")

    if (separatorIndex === -1) {
      currentArrayKey = null
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!key) {
      currentArrayKey = null
      continue
    }

    if (value) {
      frontmatter[key] = resolveObsidianFrontmatterValue(value)
      currentArrayKey = null
      continue
    }

    frontmatter[key] = []
    currentArrayKey = key
  }

  return frontmatter
}

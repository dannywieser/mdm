import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

import type { Note, NoteFrontmatter } from "../../types"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i
const FRONTMATTER_DELIMITER = "---"

export const collectMarkdownFiles = async (
  directory: string
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
    })
  )

  return nestedPaths.flat()
}

export const parseMarkdownFile = async (filePath: string): Promise<Note> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath)
  ])
  const { body, frontmatter } = extractFrontmatter(source)
  const html = await remark().use(remarkHtml).process(body)
  const basename = path.basename(filePath)

  return {
    createdDate: stats.birthtime.toISOString(),
    frontmatter,
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: path.basename(filePath, path.extname(filePath)),
    folder: path.basename(path.dirname(filePath)),
    html: String(html)
  }
}

const extractFrontmatter = (
  source: string
): { body: string; frontmatter: NoteFrontmatter | null } => {
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
    frontmatter: parseFrontmatter(frontmatterLines)
  }
}

const parseFrontmatter = (lines: string[]): NoteFrontmatter => {
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
        trimmedLine.replace(/^-+\s*/, "")
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
      frontmatter[key] = value
      currentArrayKey = null
      continue
    }

    frontmatter[key] = []
    currentArrayKey = key
  }

  return frontmatter
}

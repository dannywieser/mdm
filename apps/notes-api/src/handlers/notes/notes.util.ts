import { parseFrontMatter, parseMarkdownBodyDates, type Note } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"
import { v5 as uuidv5 } from "uuid"

import type { NotesView } from "../../config"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i
export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

const normalizeFilePathForId = (filePath: string): string =>
  path.normalize(filePath).replace(/\\/g, "/")

const createNoteId = (filePath: string): string =>
  uuidv5(normalizeFilePathForId(filePath), FILE_ID_NAMESPACE)

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

export const parseMarkdownFile = async (
  filePath: string,
  dateFormats: readonly string[] = []
): Promise<Note> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath)
  ])
  const { body, frontmatter } = parseFrontMatter(source)
  const bodyDates = parseMarkdownBodyDates(body, dateFormats)
  const html = await remark().use(remarkHtml).process(body)
  const basename = path.basename(filePath)

  return {
    createdDate: stats.birthtime.toISOString(),
    bodyDates,
    frontmatter,
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: createNoteId(filePath),
    folder: path.basename(path.dirname(filePath)),
    html: String(html)
  }
}

const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") {
    return undefined
  }

  return (value as Record<string, unknown>)[key]
}

const getValueByPath = (note: Note, filterPath: string): unknown =>
  filterPath
    .split(".")
    .filter((segment) => segment.length > 0)
    .reduce<unknown>((value, segment) => getObjectValue(value, segment), note)

const isMatchingFilterValue = (
  noteValue: unknown,
  expectedValue: string
): boolean => {
  if (typeof noteValue === "string") {
    return noteValue === expectedValue
  }

  if (Array.isArray(noteValue)) {
    return noteValue.includes(expectedValue)
  }

  return false
}

const matchesViewFilters = (
  note: Note,
  filters: Record<string, string>
): boolean =>
  Object.entries(filters).every(([filterPath, expectedValue]) =>
    isMatchingFilterValue(getValueByPath(note, filterPath), expectedValue)
  )

export const applyViewFilter = (
  notes: readonly Note[],
  configuredViews: readonly NotesView[],
  requestedViewName: string | undefined
): Note[] => {
  if (!requestedViewName) {
    return [...notes]
  }

  const selectedView = configuredViews.find(
    ({ name }) => name === requestedViewName
  )

  if (!selectedView) {
    return [...notes]
  }

  return notes.filter((note) => matchesViewFilters(note, selectedView.filters))
}

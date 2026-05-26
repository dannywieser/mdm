import type { RequestHandler } from "express"

import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

const NOTES_DIRECTORY_ENV = "NOTES_DIRECTORY"
const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i

export type Note = {
  basename: string
  createdDate: string
  folder: string
  fullPath: string
  html: string
  id: string
  modifiedDate: string
}

const collectMarkdownFiles = async (directory: string): Promise<string[]> => {
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

const parseMarkdownFile = async (filePath: string): Promise<Note> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath)
  ])
  const html = await remark().use(remarkHtml).process(source)
  const basename = path.basename(filePath)

  return {
    createdDate: stats.birthtime.toISOString(),
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: path.basename(filePath, path.extname(filePath)),
    folder: path.basename(path.dirname(filePath)),
    html: String(html)
  }
}

export const notesHandler: RequestHandler = async (_request, response) => {
  const notesDirectory = process.env[NOTES_DIRECTORY_ENV]

  if (!notesDirectory) {
    response
      .status(500)
      .json({ error: `${NOTES_DIRECTORY_ENV} environment variable is required` })
    return
  }

  try {
    const markdownFiles = (await collectMarkdownFiles(notesDirectory)).sort()
    const notes = await Promise.all(markdownFiles.map(parseMarkdownFile))

    response.status(200).json({ notes })
  } catch {
    response.status(500).json({ error: "Unable to load notes" })
  }
}

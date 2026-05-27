import { parseFrontMatter, type Note } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"
import { v5 as uuidv5 } from "uuid"

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

export const parseMarkdownFile = async (filePath: string): Promise<Note> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath)
  ])
  const { body, frontmatter } = parseFrontMatter(source)
  const html = await remark().use(remarkHtml).process(body)
  const basename = path.basename(filePath)

  return {
    createdDate: stats.birthtime.toISOString(),
    frontmatter,
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: createNoteId(filePath),
    folder: path.basename(path.dirname(filePath)),
    html: String(html)
  }
}

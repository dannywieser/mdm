import { parseFrontMatter, type Note } from "markdown"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i

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
    id: path.basename(filePath, path.extname(filePath)),
    folder: path.basename(path.dirname(filePath)),
    html: String(html)
  }
}

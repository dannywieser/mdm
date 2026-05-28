import { parseFrontMatter, parseMarkdownBodyDates, type Note } from "markdown"
import { createFileID } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"
import remark from "remark"
import remarkHtml from "remark-html"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i
export const FILE_ID_NAMESPACE = "6ba7b811-9dad-11d1-80b4-00c04fd430c8"

export const collectMarkdownFiles = async (
  directory: string,
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
    }),
  )

  return nestedPaths.flat()
}

export const parseMarkdownFile = async (
  filePath: string,
  notesDirectory: string,
  obsidianVault: string,
  dateFormats: readonly string[] = [],
): Promise<Note> => {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ])
  const { body, frontmatter } = parseFrontMatter(source)
  const bodyDates = parseMarkdownBodyDates(body, dateFormats)
  const html = await remark().use(remarkHtml).process(body)
  const basename = path.basename(filePath)
  const title = basename.endsWith(".md") ? basename.slice(0, -3) : basename
  const relativePath = path.relative(notesDirectory, filePath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const relativePathWithoutExtension = normalizedRelativePath.replace(
    /\.[^.]+$/,
    "",
  )
  const escapedFilePath = relativePathWithoutExtension
    .split("/")
    .map((segment) => encodeURI(segment))
    .join("%2F")
  const obsidianUrl = `obsidian://open?vault=${encodeURIComponent(obsidianVault)}&file=${escapedFilePath}`

  return {
    createdDate: stats.birthtime.toISOString(),
    bodyDates,
    frontmatter,
    modifiedDate: stats.mtime.toISOString(),
    fullPath: filePath,
    basename,
    id: createFileID(filePath, FILE_ID_NAMESPACE),
    folder: path.basename(path.dirname(filePath)),
    html: String(html),
    title,
    obsidianUrl,
  }
}

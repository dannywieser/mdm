import { promises as fs } from "node:fs"
import path from "node:path"

const MARKDOWN_FILE_PATTERN = /\.(md|markdown)$/i

/**
 * Recursively collects the absolute paths of all markdown (`.md`/`.markdown`)
 * files within `directory`, including nested subdirectories.
 *
 * @param directory - Absolute path to the directory to search.
 * @returns Absolute paths of every markdown file found.
 */
export const collectMarkdownFiles = async (directory: string): Promise<string[]> => {
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

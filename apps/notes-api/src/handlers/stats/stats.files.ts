import { promises as fs } from "node:fs"
import path from "node:path"

export const countFilesRecursive = async (directory: string): Promise<number> => {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    let count = 0
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += await countFilesRecursive(path.join(directory, entry.name))
      } else if (entry.isFile()) {
        count += 1
      }
    }
    return count
  } catch {
    return 0
  }
}

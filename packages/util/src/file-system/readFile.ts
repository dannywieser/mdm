import { promises as fs, Stats } from "node:fs"

export interface ReadFileResult {
  source: string
  stats: Stats
}

export async function readFile(filePath: string) {
  const [source, stats] = await Promise.all([
    fs.readFile(filePath, "utf8"),
    fs.stat(filePath),
  ])
  return { source, stats }
}

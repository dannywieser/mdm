import path from "node:path"

export function getBasename(filePath: string): string {
  return path.basename(filePath)
}

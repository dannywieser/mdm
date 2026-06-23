import path from "node:path"

export function getTitleFromFilePath(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath))
  return basename.endsWith(".md") ? basename.slice(0, -3) : basename
}

import path from "node:path"

export function getFolderFromFilePath(rootDir: string, filePath: string) {
  const relativePath = path.relative(rootDir, filePath)
  const folder = path.dirname(relativePath)
  return folder === "." ? "" : folder.split(path.sep).join("/")
}

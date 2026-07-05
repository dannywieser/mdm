import { countWords } from "mdm-util"
import path from "node:path"

export const resolveNoteFolder = (notesDirectory: string, filePath: string): string =>
  path.relative(notesDirectory, path.dirname(filePath)).split(path.sep).join("/")

export const countDistinctFolders = (folders: readonly string[]): number =>
  new Set(folders).size

export const sumWordCounts = (bodies: readonly string[]): number =>
  bodies.reduce((total, body) => total + countWords(body), 0)

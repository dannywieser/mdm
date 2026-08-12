import { isExternalUrl } from "mdm-util"
import path from "node:path"

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const resolveMultiComponentImagePath = (decodedImagePath: string, noteRelativePath: string): string => {
  if (decodedImagePath.startsWith("/")) {
    return decodedImagePath.replace(/^\/+/, "")
  }
  if (decodedImagePath.startsWith("./") || decodedImagePath.startsWith("../")) {
    return path.posix.join(path.posix.dirname(noteRelativePath), decodedImagePath)
  }
  return decodedImagePath
}

// Resolves a raw image path found in a note's body to a vault-relative path, or
// null if it's external, empty, or would traverse outside the vault. A bare
// filename (no "/") is resolved into `<attachmentsDirectory>/<noteDir>/<noteStem>/<file>`,
// matching Obsidian's per-note attachment folder convention.
export const resolveLocalImagePath = (
  rawImagePath: string,
  noteRelativePath: string,
  attachmentsDirectory = "",
): string | null => {
  const sanitizedImagePath = rawImagePath.trim()

  if (!sanitizedImagePath || isExternalUrl(sanitizedImagePath)) {
    return null
  }

  const baseImagePath = sanitizedImagePath.split(/[?#]/)[0] ?? ""

  if (!baseImagePath) {
    return null
  }

  const decodedImagePath = safeDecodeURIComponent(baseImagePath)

  if (!decodedImagePath.includes("/")) {
    const noteDir = path.posix.dirname(noteRelativePath)
    const noteStem = path.posix.basename(noteRelativePath).replace(/\.[^.]+$/, "")
    const parts: string[] = []
    if (attachmentsDirectory) parts.push(attachmentsDirectory)
    if (noteDir !== ".") parts.push(noteDir)
    parts.push(noteStem, decodedImagePath)
    return path.posix.join(...parts)
  }

  const resolvedImagePath = resolveMultiComponentImagePath(decodedImagePath, noteRelativePath)
  const normalizedImagePath = path.posix.normalize(resolvedImagePath)

  if (
    normalizedImagePath === "" ||
    normalizedImagePath === "." ||
    normalizedImagePath === ".." ||
    normalizedImagePath.startsWith("../")
  ) {
    return null
  }

  return normalizedImagePath
}

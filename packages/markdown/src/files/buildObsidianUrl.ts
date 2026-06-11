import path from "node:path"

/**
 * Builds an `obsidian://open` deep link for a file within an Obsidian vault.
 *
 * @param obsidianVault - Name of the Obsidian vault.
 * @param notesDirectory - Absolute path to the vault root on disk.
 * @param filePath - Absolute path to the file within the vault.
 * @returns An `obsidian://open` URL pointing at the file, with each path
 * segment percent-encoded.
 */
export const buildObsidianUrl = (
  obsidianVault: string,
  notesDirectory: string,
  filePath: string,
): string => {
  const relativePath = path.relative(notesDirectory, filePath)
  const normalizedRelativePath = relativePath.split(path.sep).join("/")
  const relativePathWithoutExtension = normalizedRelativePath.replace(/\.[^.]+$/, "")
  const escapedFilePath = relativePathWithoutExtension
    .split("/")
    .map((segment) => encodeURI(segment))
    .join("%2F")

  return `obsidian://open?vault=${encodeURIComponent(obsidianVault)}&file=${escapedFilePath}`
}

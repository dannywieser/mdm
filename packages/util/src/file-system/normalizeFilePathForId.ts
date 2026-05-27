import path from "node:path"

/**
 * Normalizes file paths so IDs are stable across operating systems.
 *
 * @param filePath File path to normalize.
 * @returns Normalized path using forward slashes.
 */
export const normalizeFilePathForId = (filePath: string): string =>
  path.normalize(filePath).replace(/\\/g, "/")

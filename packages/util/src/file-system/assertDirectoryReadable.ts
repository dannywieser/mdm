import { access, constants } from "node:fs/promises"

/**
 * Throws if the given directory does not exist or is not readable.
 *
 * @param directory Absolute path to check.
 */
export const assertDirectoryReadable = async (directory: string): Promise<void> => {
  await access(directory, constants.R_OK)
}

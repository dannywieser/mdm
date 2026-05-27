import { v5 as uuidv5 } from "uuid"

import { normalizeFilePathForId } from "../file-system/normalizeFilePathForId"

/**
 * Creates a deterministic UUID for a file path within a namespace.
 *
 * @param filePath File path used as the deterministic ID seed.
 * @param namespace UUID namespace used for UUIDv5 generation.
 * @returns Deterministic UUID for the normalized file path.
 */
export const createFileID = (filePath: string, namespace: string): string =>
  uuidv5(normalizeFilePathForId(filePath), namespace)

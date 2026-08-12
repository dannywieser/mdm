import type { NoteSyncPayload, ScannedNote } from "markdown"

import { isNonEmptyString, isStringArray } from "mdm-util"

/**
 * Validates the fields notes-api relies on downstream (view filtering,
 * markdown parsing, wikilink resolution) are present with the right shape.
 * This endpoint has no auth, so this is the only thing standing between a
 * malformed payload and a note that breaks notes-api later.
 */
const isScannedNote = (value: unknown): value is ScannedNote => {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const note = value as Record<string, unknown>

  return (
    isNonEmptyString(note.id) &&
    typeof note.title === "string" &&
    typeof note.basename === "string" &&
    typeof note.fullPath === "string" &&
    typeof note.fullText === "string" &&
    typeof note.obsidianUrl === "string" &&
    typeof note.modifiedDate === "string" &&
    (note.createdDate === null || typeof note.createdDate === "string") &&
    isStringArray(note.dates) &&
    typeof note.frontmatter === "object"
  )
}

/** Validates an untrusted request body against the NoteSyncPayload shape. */
export const validateSyncPayload = (body: unknown): NoteSyncPayload => {
  if (typeof body !== "object" || body === null) {
    throw new Error("request body must be a JSON object")
  }

  const { deletedIds, upserts } = body as Record<string, unknown>

  if (!Array.isArray(upserts) || !upserts.every(isScannedNote)) {
    throw new Error("upserts must be an array of valid ScannedNote objects")
  }

  if (!isStringArray(deletedIds)) {
    throw new Error("deletedIds must be an array of non-empty strings")
  }

  return { deletedIds, upserts }
}

import type { NoteSyncPayload, ScannedNote } from "markdown"

import { isNonEmptyString, isStringArray } from "mdm-util"

const isScannedNote = (value: unknown): value is ScannedNote =>
  typeof value === "object" &&
  value !== null &&
  isNonEmptyString((value as { id?: unknown }).id)

/** Validates an untrusted request body against the NoteSyncPayload shape. */
export const validateSyncPayload = (body: unknown): NoteSyncPayload => {
  if (typeof body !== "object" || body === null) {
    throw new Error("request body must be a JSON object")
  }

  const { deletedIds, upserts } = body as Record<string, unknown>

  if (!Array.isArray(upserts) || !upserts.every(isScannedNote)) {
    throw new Error("upserts must be an array of notes with a non-empty id")
  }

  if (!isStringArray(deletedIds)) {
    throw new Error("deletedIds must be an array of non-empty strings")
  }

  return { deletedIds, upserts }
}

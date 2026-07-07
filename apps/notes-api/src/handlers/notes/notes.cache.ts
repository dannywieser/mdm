import type { NotesScanCache } from "./notes.cache.types"
import type { ScannedNote } from "./notes.types"

/**
 * Creates a time-to-live cache for the full vault scan (collectMarkdownFiles
 * + scanMarkdownFile for every file). Concurrent callers during a cache miss
 * share a single in-flight scan rather than each triggering their own vault
 * walk, and a failed scan is not cached so the next call retries.
 */
export const createNotesScanCache = (
  ttlMs: number,
  now: () => number = Date.now,
): NotesScanCache => {
  let cachedNotes: ScannedNote[] | null = null
  let cachedAt = 0
  let pendingScan: Promise<ScannedNote[]> | null = null

  const get = (scan: () => Promise<ScannedNote[]>): Promise<ScannedNote[]> => {
    if (cachedNotes !== null && now() - cachedAt < ttlMs) {
      return Promise.resolve(cachedNotes)
    }

    pendingScan ??= scan()
      .then((result) => {
        cachedNotes = result
        cachedAt = now()
        return result
      })
      .finally(() => {
        pendingScan = null
      })

    return pendingScan
  }

  return { get }
}

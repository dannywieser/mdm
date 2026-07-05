import type { SessionStorageLike } from "./demoFlags.types"

const DEMO_FLAG_KEY_PREFIX = "mdm-demo-flag"

const buildKey = (noteId: string, flag: string): string =>
  `${DEMO_FLAG_KEY_PREFIX}:${flag}:${noteId}`

const getSessionStorage = (): SessionStorageLike => {
  const storage = (globalThis as { sessionStorage?: SessionStorageLike }).sessionStorage
  if (!storage) {
    throw new Error("Session storage is not available")
  }
  return storage
}

/**
 * Session-storage replacement for the redis-backed flag-manager, used in
 * demo mode. Flags are per-browser-session and reset when the tab closes.
 */
export const readDemoFlag = (noteId: string, flag: string): boolean =>
  getSessionStorage().getItem(buildKey(noteId, flag)) === "true"

/** Flips a flag and returns the new value, mirroring the flag-manager API. */
export const toggleDemoFlag = (noteId: string, flag: string): boolean => {
  const nextValue = !readDemoFlag(noteId, flag)
  const storage = getSessionStorage()
  if (nextValue) {
    storage.setItem(buildKey(noteId, flag), "true")
  } else {
    storage.removeItem(buildKey(noteId, flag))
  }
  return nextValue
}

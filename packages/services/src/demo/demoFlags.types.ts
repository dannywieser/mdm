/**
 * Minimal shape of the browser's Storage interface, declared locally so this
 * package type-checks in consumers compiled without DOM lib types.
 */
export interface SessionStorageLike {
  getItem(key: string): string | null
  removeItem(key: string): void
  setItem(key: string, value: string): void
}

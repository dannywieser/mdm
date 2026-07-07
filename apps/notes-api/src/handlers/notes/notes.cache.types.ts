import type { ScannedNote } from "./notes.types"

export interface NotesScanCache {
  get: (scan: () => Promise<ScannedNote[]>) => Promise<ScannedNote[]>
}

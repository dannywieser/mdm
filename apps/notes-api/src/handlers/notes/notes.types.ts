import type { Note } from "markdown"

export type ScannedNote = Omit<Note, "content">

export interface WikilinkReplacement {
  displayText: string
  matchedNote: ScannedNote | null
}

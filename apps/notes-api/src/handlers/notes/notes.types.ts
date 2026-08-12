import type { ScannedNote } from "markdown"

export type { ScannedNote }

export interface WikilinkReplacement {
  displayText: string
  matchedNote: ScannedNote | null
}

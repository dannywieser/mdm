import type { Note } from "markdown"

export interface MarkdownNode {
  children?: MarkdownNode[]
  type?: string
  url?: string
}

export type ScannedNote = Omit<Note, "html">

export interface WikilinkReplacement {
  displayText: string
  matchedNote: ScannedNote | null
}

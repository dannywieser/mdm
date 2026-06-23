import type { Note, WikilinkReplacement } from "markdown"

export type ScannedNote = Omit<Note, "content">

export type { WikilinkReplacement }

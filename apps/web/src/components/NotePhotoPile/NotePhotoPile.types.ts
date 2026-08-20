import type { Note } from "markdown"

/** Where a single print sits in the pile, relative to the pile container. */
export interface PhotoPlacement {
  /** CSS `left` value: prints spread out until they run out of room. */
  left: string
  /** Horizontal jitter, in pixels. */
  offsetX: number
  /** Vertical jitter, in pixels. */
  offsetY: number
  /** Tilt of the print, in degrees. */
  rotation: number
  /** Stacking order, so later prints sit on top of earlier ones. */
  zIndex: number
}

export interface PhotoPlacementInput {
  count: number
  index: number
  noteId: string
}

export interface PhotoPrintProps {
  count: number
  index: number
  note: Note
}

export interface NotePhotoPileProps {
  notes: Note[]
}

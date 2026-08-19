import type { Note } from "markdown"

/**
 * `default` is the full-page gallery. `compact` is the smaller-thumbnail
 * layout used by dashboard preview cards.
 */
export type NoteCoverGridVariant = "compact" | "default"

export interface MasonryLayout {
  columns: Record<string, number>
  gapPx: number
  padding: number
  rowHeightPx: number
  titleFontSize: string
}

export interface GalleryCardProps {
  badges: string[]
  layout: MasonryLayout
  note: Note
}

export interface NoteCoverGridProps {
  badges?: string[]
  notes: Note[]
  variant?: NoteCoverGridVariant
}

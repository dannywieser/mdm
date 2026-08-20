import type { Note } from "markdown"

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
}

import type { Note } from "markdown"

export interface GalleryCardProps {
  aspectRatio?: string
  badges: string[]
  note: Note
}

export interface NoteCoverGridProps {
  aspectRatio?: string
  badges?: string[]
  notes: Note[]
}

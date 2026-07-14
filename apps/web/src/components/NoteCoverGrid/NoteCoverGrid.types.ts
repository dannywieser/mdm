import type { Note } from "markdown"

export interface GalleryCardProps {
  badges: string[]
  note: Note
}

export interface NoteCoverGridProps {
  badges?: string[]
  notes: Note[]
}

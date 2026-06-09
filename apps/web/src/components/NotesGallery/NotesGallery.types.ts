import type { Note } from "markdown"

export type NotesGalleryRouteParamKey = "view"

export interface GalleryCardProps {
  aspectRatio?: string
  badges: string[]
  note: Note
}

export interface NotesGalleryProps {
  aspectRatio?: string
  badges?: string[]
}

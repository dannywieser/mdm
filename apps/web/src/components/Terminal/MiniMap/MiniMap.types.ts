import type { Note } from 'markdown'

export interface MiniMapProps {
  notes: Note[]
  onSelect: (noteId: string) => void
}

import type { Note } from 'markdown'

export interface MiniMapProps {
  isOpen?: boolean
  notes: Note[]
  onClose?: () => void
  onSelect: (noteId: string) => void
}

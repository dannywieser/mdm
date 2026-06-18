import type { Note } from "markdown"

import type { TocNote } from "../NotesReviewTableOfContents/NotesReviewTableOfContents.types"

export interface NotesReviewContentProps {
  badges: string[]
  currentIndex: number
  currentNote: Note
  isPending: boolean
  onMarkAsRead: () => void
  tocNotes: TocNote[]
}

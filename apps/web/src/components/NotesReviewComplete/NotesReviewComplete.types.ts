export interface ReviewedNote {
  id: string
  title: string
  obsidianUrl: string
}

export interface NotesReviewCompleteProps {
  isLoading: boolean
  reviewedNotes: ReviewedNote[]
}

export interface TocNote {
  id: string
  obsidianUrl: string
  title: string
  isRead: boolean
}

export interface NotesReviewTableOfContentsProps {
  notes: TocNote[]
  currentIndex: number
}

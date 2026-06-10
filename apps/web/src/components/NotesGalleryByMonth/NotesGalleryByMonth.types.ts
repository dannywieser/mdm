export type NotesGalleryByMonthRouteParamKey = "view"

export interface NotesGalleryByMonthProps {
  aspectRatio?: string
  badges?: string[]
  year?: number
}

export interface NoteYearMonth {
  month: number
  year: number
}

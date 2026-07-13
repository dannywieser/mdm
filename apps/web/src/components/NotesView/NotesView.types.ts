export type NotesViewRouteParamKey = "view"

export type ViewComponentName =
  | "NotesList"
  | "NotesGallery"
  | "NotesGalleryByMonth"
  | "NotesGalleryByYear"
  | "NotesReview"
  | "NotesSummaryTable"

export interface ViewComponentProps {
  aspectRatio?: string
  badges?: string[]
  coverProperty: string
  layout?: string
}

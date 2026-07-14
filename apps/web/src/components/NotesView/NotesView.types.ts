export type NotesViewRouteParamKey = "view"

export type ViewComponentName =
  | "NotesList"
  | "NotesGallery"
  | "NotesReview"
  | "NotesSummaryTable"

export interface ViewComponentProps {
  aspectRatio?: string
  badges?: string[]
  layout?: string
}

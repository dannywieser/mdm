export type NotesViewRouteParamKey = "view"

export type ViewComponentName =
  | "NotesList"
  | "NotesGallery"
  | "NotesReview"
  | "NotesSummaryTable"

export interface ViewComponentProps {
  badges?: string[]
  frontmatterFilters?: string[]
}

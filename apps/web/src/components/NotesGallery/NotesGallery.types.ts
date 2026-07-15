export type NotesGalleryRouteParamKey = "view"

export interface NotesGalleryProps {
  badges?: string[]
  notesGalleryFilters?: string[]
}

export interface FrontmatterFacet {
  key: string
  values: string[]
}

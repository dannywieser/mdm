export type NotesGalleryRouteParamKey = "view"

export interface NotesGalleryProps {
  badges?: string[]
  frontmatterFilters?: string[]
}

export interface FrontmatterFacet {
  key: string
  values: string[]
}

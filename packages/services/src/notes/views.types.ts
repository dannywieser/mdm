export interface ViewSummary {
  badges?: string[]
  component: string
  count: number
  notesGalleryFilters?: string[]
  group?: string
  id: string
  name: string
  noteIds: string[]
}

export interface ViewsResponse {
  views: ViewSummary[]
}

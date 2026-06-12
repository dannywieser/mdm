export interface ViewSummary {
  aspectRatio?: string
  badges?: string[]
  component: string
  count: number
  group?: string
  id: string
  layout?: string
  name: string
  noteIds: string[]
}

export interface ViewsResponse {
  views: ViewSummary[]
}

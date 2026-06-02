export interface StatsViewCount {
  component: string
  count: number
  id: string
  name: string
}

export interface StatsResponse {
  modifiedToday: number
  totalNotes: number
  views: StatsViewCount[]
}

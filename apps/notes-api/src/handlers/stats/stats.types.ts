export interface StatsViewCount {
  count: number
  name: string
}

export interface StatsResponse {
  modifiedToday: number
  totalNotes: number
  views: StatsViewCount[]
}

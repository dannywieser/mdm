export interface HistoryNoteDates {
  createdDate: string | null
  folder: string
  modifiedDate: string
}

export interface StatsHistoryEntry {
  date: string
  entriesCreated: number
  entriesModified: number
  foldersTouched: number
}

export type StatsHistoryResponse = StatsHistoryEntry[]

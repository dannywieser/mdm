import type { HomeStatsConfig } from "app-config"

export type { HomeStatsConfig }

export interface StatsViewCount {
  aspectRatio?: string
  badges?: string[]
  component: string
  count: number
  id: string
  layout?: string
  name: string
}

export interface FolderCount {
  count: number
  folder: string
}

export interface NotePerDay {
  count: number
  date: string
}

export interface NotesCreatedStats {
  last30Days: number
  last90Days: number
  last365Days: number
}

export interface StatsTrends {
  changePercent: number
  notesLast30Days: number
  notesPrevious30Days: number
}

export interface StatsResponse {
  folderBreakdown: FolderCount[]
  homeStats: HomeStatsConfig
  modifiedToday: number
  notesCreated: NotesCreatedStats
  notesPerDay: NotePerDay[]
  notesWithoutCreatedDate: number
  totalAttachments: number
  totalFolders: number
  totalNotes: number
  trends: StatsTrends
  views: StatsViewCount[]
}

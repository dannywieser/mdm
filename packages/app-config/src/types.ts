export interface ExcludeViewFilter {
  $exclude: Record<string, string>
}

export type ViewFilter = ExcludeViewFilter | Record<string, string>

export interface NotesView {
  aspectRatio?: string
  badges?: string[]
  component: string
  filters: ViewFilter[]
  id: string
  layout?: string
  name: string
}

export interface HomeStatsShowConfig {
  folderBreakdown: boolean
  modifiedToday: boolean
  notesCreated: boolean
  notesPerDay: boolean
  notesWithoutCreatedDate: boolean
  totalAttachments: boolean
  totalFolders: boolean
  totalNotes: boolean
  trends: boolean
}

export interface HomeStatsConfig {
  show: HomeStatsShowConfig
}

export interface ResolvedNotesConfig {
  attachmentsDirectory: string
  createdDateProperty: string
  dateFormats: string[]
  deriveTitleDate: boolean
  homeStats: HomeStatsConfig
  notesDirectory: string
  obsidianVault: string
  timezone: string
  views: NotesView[]
}

export interface AppConfig {
  attachmentsDirectory?: string
  createdDateProperty?: string
  dateFormats?: string[]
  deriveTitleDate?: boolean
  homeStats?: {
    show?: Partial<HomeStatsShowConfig>
  }
  obsidianVault: string
  timezone?: string
  views?: AppConfigView[]
}

export interface AppConfigView {
  aspectRatio?: string
  badges?: string[]
  component: string
  filters: ViewFilter[]
  id: string
  layout?: string
  name: string
}

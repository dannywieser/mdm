export type HabitMode = "do-more" | "do-less"

export interface HabitConfig {
  frontmatterProperty: string
  id: string
  mode: HabitMode
  name: string
  targetScore?: number
  trackingWindowDays: number
}

export interface ExcludeViewFilter {
  $exclude: Record<string, string>
}

export type ViewFilter = ExcludeViewFilter | Record<string, string>

export interface NotesView {
  aspectRatio?: string
  badges?: string[]
  component: string
  filters: ViewFilter[]
  group?: string
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
  habits: HabitConfig[]
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
  habits?: HabitConfig[]
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
  group?: string
  id: string
  layout?: string
  name: string
}

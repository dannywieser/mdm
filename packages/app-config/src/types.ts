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

export interface ResolvedNotesConfig {
  attachmentsDirectory: string
  createdDateProperty: string
  dateFormats: string[]
  deriveTitleDate: boolean
  habits: HabitConfig[]
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

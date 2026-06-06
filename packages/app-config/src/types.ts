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

export interface ResolvedNotesConfig {
  attachmentsDirectory: string
  dateFormats: string[]
  notesDirectory: string
  obsidianVault: string
  timezone: string
  views: NotesView[]
}

export interface AppConfig {
  attachmentsDirectory?: string
  dateFormats?: string[]
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

export interface NotesView {
  badges?: string[]
  component: string
  filters: Record<string, string>[]
  id: string
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
  noteRootDirectory: string
  obsidianVault: string
  timezone?: string
  views?: AppConfigView[]
}

export interface AppConfigView {
  badges?: string[]
  component: string
  filters: Record<string, string>[]
  id: string
  name: string
}

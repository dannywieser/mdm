export interface NotesView {
  filters: Record<string, string>
  name: string
}

export interface ResolvedNotesConfig {
  dateFormats: string[]
  notesDirectory: string
  obsidianVault: string
  views: NotesView[]
}

export interface AppConfig {
  dateFormats?: string[]
  noteRootDirectory: string
  obsidianVault: string
  views?: AppConfigView[]
}

export interface AppConfigView {
  filters: Record<string, string>
  name: string
}

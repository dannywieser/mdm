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

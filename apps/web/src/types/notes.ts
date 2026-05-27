export interface Note {
  basename: string
  bodyDates: string[]
  createdDate: string
  folder: string
  frontmatter: Record<string, string | string[]> | null
  fullPath: string
  html: string
  id: string
  modifiedDate: string
}

export interface NotesResponse {
  notes: Note[]
  notesDirectory: string
  obsidianVault: string
}

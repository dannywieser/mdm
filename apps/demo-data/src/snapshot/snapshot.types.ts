export interface SnapshotView {
  id: string
}

export interface SnapshotViewsPayload {
  views: SnapshotView[]
}

export interface SnapshotHabitSummary {
  habitId: string
}

export interface SnapshotNote {
  /** Absolute path of the note's markdown file inside the demo vault. */
  fullPath: string
  id: string
}

export interface SnapshotNotesPayload {
  notes: SnapshotNote[]
}

export interface BuildSnapshotOptions {
  /** Absolute path to the vault's attachments directory (copied for covers). */
  attachmentsSourceDirectory: string
  /** Base URL of a running habit-tracker instance. */
  habitsBaseUrl: string
  /** Base URL of a running notes-api instance. */
  notesBaseUrl: string
  /** Directory the static JSON snapshot is written into. */
  outputDirectory: string
}

export interface SnapshotSummary {
  habitCount: number
  noteCount: number
  viewCount: number
}

export interface StartServiceOptions {
  env: Record<string, string>
  port: number
  /** Absolute path to the service's compiled server entry point. */
  serverPath: string
}

export interface RunningService {
  baseUrl: string
  stop: () => void
}

export interface WaitForHealthOptions {
  attempts?: number
  delayMs?: number
}

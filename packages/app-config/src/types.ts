import type { HabitScoringConfig } from "./habits/habitScoring.types"

export type { HabitScoringConfig } from "./habits/habitScoring.types"

export type HabitMode = "do-more" | "do-less"

export interface HabitConfig {
  frontmatterProperty: string
  id: string
  mode: HabitMode
  name: string
  scoring: HabitScoringConfig
  targetScore?: number
  trackingWindowDays: number
}

export interface ExcludeViewFilter {
  $exclude: Record<string, string>
}

export type ViewFilter = ExcludeViewFilter | Record<string, string>

export interface NotesView {
  badges?: string[]
  component: string
  dashboardPreview?: boolean
  filters: ViewFilter[]
  notesGalleryFilters?: string[]
  group?: string
  id: string
  name: string
}

export type NotesSource = "bear" | "obsidian"

export interface ResolvedNotesConfig {
  attachmentsDirectory: string
  createdDateProperty: string
  dateFormats: string[]
  habits: HabitConfig[]
  notesDirectory: string
  notesSource: NotesSource
  obsidianVault: string
  timezone: string
  views: NotesView[]
}

export interface AppConfig {
  attachmentsDirectory?: string
  dateFormats?: string[]
  habits?: HabitConfig[]
  notesSource?: NotesSource
  obsidianVault: string
  timezone?: string
  views?: AppConfigView[]
}

export interface AppConfigView {
  badges?: string[]
  component: string
  dashboardPreview?: boolean
  filters: ViewFilter[]
  notesGalleryFilters?: string[]
  group?: string
  id: string
  name: string
}

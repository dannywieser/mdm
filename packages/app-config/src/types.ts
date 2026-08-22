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

export interface TransactionsConfig {
  /** Frontmatter property holding the signed transaction amount. */
  amountProperty: string
  /** Frontmatter property holding the transaction category. */
  categoryProperty: string
  /** ISO 4217 currency code used to format amounts in the UI. */
  currency: string
  /** Frontmatter property holding the transaction (or first occurrence) date. */
  dateProperty: string
  /** Frontmatter property holding the human-readable description. */
  descriptionProperty: string
  /** Vault-relative folder to restrict the scan to; empty scans the whole vault. */
  folder: string
  /** Frontmatter property holding the last date a recurrence may occur on. */
  recurrenceEndProperty: string
  /** Frontmatter property holding the recurrence rule; absent means one-off. */
  recurrenceProperty: string
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
  transactions: TransactionsConfig
  views: NotesView[]
}

export interface AppConfig {
  attachmentsDirectory?: string
  dateFormats?: string[]
  habits?: HabitConfig[]
  notesSource?: NotesSource
  obsidianVault: string
  timezone?: string
  transactions?: TransactionsConfig
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

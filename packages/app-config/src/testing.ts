import type { ResolvedNotesConfig } from "./types"

export const createMockNotesConfig = (overrides: Partial<ResolvedNotesConfig> = {}): ResolvedNotesConfig => ({
  attachmentsDirectory: "",
  createdDateProperty: "created",
  dateFormats: [],
  habits: [],
  notesDirectory: "/notes",
  notesSource: "obsidian",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [],
  ...overrides,
})

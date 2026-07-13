import type { ResolvedNotesConfig } from "./types"

export const createMockNotesConfig = (overrides: Partial<ResolvedNotesConfig> = {}): ResolvedNotesConfig => ({
  attachmentsDirectory: "",
  coverProperty: "cover",
  createdDateProperty: "created",
  dateFormats: [],
  habits: [],
  notesDirectory: "/notes",
  obsidianVault: "vault",
  timezone: "UTC",
  views: [],
  ...overrides,
})

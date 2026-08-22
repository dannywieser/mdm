import type { ResolvedNotesConfig } from "./types"

import { DEFAULT_TRANSACTIONS_CONFIG } from "./transactions/transactions"

export const createMockNotesConfig = (overrides: Partial<ResolvedNotesConfig> = {}): ResolvedNotesConfig => ({
  attachmentsDirectory: "",
  createdDateProperty: "created",
  dateFormats: [],
  habits: [],
  notesDirectory: "/notes",
  notesSource: "obsidian",
  obsidianVault: "vault",
  timezone: "UTC",
  transactions: { ...DEFAULT_TRANSACTIONS_CONFIG },
  views: [],
  ...overrides,
})

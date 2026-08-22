import { isNonEmptyString } from "mdm-util"
import path from "node:path"

import type { NotesSource, ResolvedNotesConfig } from "./types"

import { DEFAULT_HABIT_SCORING } from "./habits/habitScoring"
import { readAppConfigFile } from "./readAppConfigFile"
import { DEFAULT_TRANSACTIONS_CONFIG } from "./transactions/transactions"
import { validateAppConfig } from "./validateAppConfig/validateAppConfig"

export type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  HabitMode,
  HabitScoringConfig,
  NotesSource,
  NotesView,
  ResolvedNotesConfig,
  TransactionsConfig,
  ViewFilter,
} from "./types"

export { DEFAULT_HABIT_SCORING }

export { DEFAULT_TRANSACTIONS_CONFIG }

export { readAppConfigFile } from "./readAppConfigFile"

let cachedNotesConfig: ResolvedNotesConfig | undefined

/**
 * NOTES_ROOT only matters for the Obsidian file-scan source — the Bear
 * source reads from Redis instead, so requiring it there would block
 * startup for no reason. Bear mode gets a harmless empty-string placeholder.
 */
const resolveNotesDirectory = (notesSource: NotesSource): string => {
  if (notesSource !== "obsidian") {
    return ""
  }

  const noteRootDirectory = process.env.NOTES_ROOT?.trim()

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new Error("NOTES_ROOT environment variable is required")
  }

  return path.resolve(noteRootDirectory)
}

export const resolveNotesConfig = async (): Promise<ResolvedNotesConfig> => {
  if (cachedNotesConfig) {
    return cachedNotesConfig
  }

  const raw = await readAppConfigFile()
  const appConfig = validateAppConfig(raw)
  const rawConfig = raw as Record<string, unknown>
  const notesSource = appConfig.notesSource ?? "obsidian"

  cachedNotesConfig = {
    attachmentsDirectory: appConfig.attachmentsDirectory ?? "",
    createdDateProperty: isNonEmptyString(rawConfig.createdDateProperty)
      ? rawConfig.createdDateProperty
      : "created",
    dateFormats: appConfig.dateFormats ?? [],
    habits: appConfig.habits ?? [],
    notesDirectory: resolveNotesDirectory(notesSource),
    notesSource,
    obsidianVault: appConfig.obsidianVault,
    timezone: appConfig.timezone ?? "UTC",
    transactions: appConfig.transactions ?? { ...DEFAULT_TRANSACTIONS_CONFIG },
    views: appConfig.views ?? [],
  }

  return cachedNotesConfig
}

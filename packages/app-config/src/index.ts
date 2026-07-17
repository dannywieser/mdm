import { isNonEmptyString } from "mdm-util"
import path from "node:path"

import type { ResolvedNotesConfig } from "./types"

import { DEFAULT_HABIT_SCORING } from "./habits/habitScoring"
import { readAppConfigFile } from "./readAppConfigFile"
import { validateAppConfig } from "./validateAppConfig/validateAppConfig"

export type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  HabitMode,
  HabitScoringConfig,
  NotesView,
  ResolvedNotesConfig,
  ViewFilter,
} from "./types"

export { DEFAULT_HABIT_SCORING }

export { readAppConfigFile } from "./readAppConfigFile"

let cachedNotesConfig: ResolvedNotesConfig | undefined

export const resolveNotesConfig = async (): Promise<ResolvedNotesConfig> => {
  if (cachedNotesConfig) {
    return cachedNotesConfig
  }

  const raw = await readAppConfigFile()
  const appConfig = validateAppConfig(raw)
  const rawConfig = raw as Record<string, unknown>

  const noteRootDirectory = process.env.NOTES_ROOT?.trim()

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new Error("NOTES_ROOT environment variable is required")
  }

  cachedNotesConfig = {
    attachmentsDirectory: appConfig.attachmentsDirectory ?? "",
    createdDateProperty: isNonEmptyString(rawConfig.createdDateProperty)
      ? rawConfig.createdDateProperty
      : "created",
    dateFormats: appConfig.dateFormats ?? [],
    habits: appConfig.habits ?? [],
    notesDirectory: path.resolve(noteRootDirectory),
    obsidianVault: appConfig.obsidianVault,
    timezone: appConfig.timezone ?? "UTC",
    views: appConfig.views ?? [],
  }

  return cachedNotesConfig
}

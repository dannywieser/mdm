import {
  isNonEmptyString,
  isStringArray,
  isValidTimezone,
} from "mdm-util"
import path from "node:path"

import type {
  AppConfig,
  ResolvedNotesConfig,
} from "./types"

import { validateHabits } from "./habits/habits"
import { readAppConfigFile } from "./readAppConfigFile"
import { validateViews } from "./views/views"

export type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  HabitMode,
  NotesView,
  ResolvedNotesConfig,
  ViewFilter,
} from "./types"

export { readAppConfigFile } from "./readAppConfigFile"

let cachedNotesConfig: ResolvedNotesConfig | undefined

const assertOptionalString = (value: unknown, field: string): void => {
  if (value !== undefined && !isNonEmptyString(value)) {
    throw new Error(`app.config.json ${field} must be a non-empty string`)
  }
}

const validateAppConfig = (raw: unknown): AppConfig => {
  if (!raw || typeof raw !== "object") {
    throw new Error("app.config.json must be a JSON object")
  }

  const config = raw as Record<string, unknown>

  if (!isNonEmptyString(config.obsidianVault)) {
    throw new Error("app.config.json requires a non-empty obsidianVault value")
  }

  assertOptionalString(config.attachmentsDirectory, "attachmentsDirectory")
  assertOptionalString(config.createdDateProperty, "createdDateProperty")

  if (config.dateFormats !== undefined && !isStringArray(config.dateFormats)) {
    throw new Error("app.config.json dateFormats must be an array of non-empty strings")
  }

  if (config.timezone !== undefined && (!isNonEmptyString(config.timezone) || !isValidTimezone(config.timezone))) {
    throw new Error("app.config.json timezone must be a valid IANA timezone identifier")
  }

  if (config.deriveTitleDate !== undefined && typeof config.deriveTitleDate !== "boolean") {
    throw new Error("app.config.json deriveTitleDate must be a boolean")
  }

  return {
    attachmentsDirectory: isNonEmptyString(config.attachmentsDirectory) ? config.attachmentsDirectory : undefined,
    createdDateProperty: isNonEmptyString(config.createdDateProperty) ? config.createdDateProperty : undefined,
    dateFormats: isStringArray(config.dateFormats) ? config.dateFormats : undefined,
    deriveTitleDate: typeof config.deriveTitleDate === "boolean" ? config.deriveTitleDate : undefined,
    habits: validateHabits(config.habits),
    obsidianVault: config.obsidianVault,
    timezone: isNonEmptyString(config.timezone) ? config.timezone : undefined,
    views: validateViews(config.views),
  }
}

export const resolveNotesConfig = async (): Promise<ResolvedNotesConfig> => {
  if (cachedNotesConfig) {
    return cachedNotesConfig
  }

  const parsedAppConfig = await readAppConfigFile()
  const appConfig = validateAppConfig(parsedAppConfig)

  const noteRootDirectory = process.env.NOTES_ROOT?.trim()

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new Error("NOTES_ROOT environment variable is required")
  }

  cachedNotesConfig = {
    attachmentsDirectory: appConfig.attachmentsDirectory ?? "attachments",
    createdDateProperty: appConfig.createdDateProperty ?? "created",
    dateFormats: appConfig.dateFormats ?? [],
    deriveTitleDate: appConfig.deriveTitleDate ?? false,
    habits: appConfig.habits ?? [],
    notesDirectory: path.resolve(noteRootDirectory),
    obsidianVault: appConfig.obsidianVault,
    timezone: appConfig.timezone ?? "UTC",
    views: appConfig.views ?? [],
  }

  return cachedNotesConfig
}

export const resolveNotesDirectory = async (): Promise<string> =>
  (await resolveNotesConfig()).notesDirectory

export const clearConfigCache = (): void => {
  cachedNotesConfig = undefined
}

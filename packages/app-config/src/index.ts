import {
  isNonEmptyString,
  isStringArray,
  isStringRecord,
  isValidTimezone,
} from "mdm-util"
import path from "node:path"

import type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  ResolvedNotesConfig,
} from "./types"

import { readAppConfigFile } from "./readAppConfigFile"

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

const isExcludeViewFilter = (value: unknown): value is ExcludeViewFilter => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)

  return keys.length === 1 && keys[0] === "$exclude" && isStringRecord(obj.$exclude)
}

const isViewFilter = (value: unknown): boolean => {
  if (isExcludeViewFilter(value)) {
    return true
  }

  if (!isStringRecord(value)) {
    return false
  }

  return !("$exclude" in value)
}

const isAppConfigView = (value: unknown): value is AppConfigView => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.component) &&
    (obj.badges === undefined || isStringArray(obj.badges)) &&
    (obj.group === undefined || isNonEmptyString(obj.group)) &&
    Array.isArray(obj.filters) &&
    (obj.filters as unknown[]).every(isViewFilter)
  )
}

const isHabitConfig = (value: unknown): value is HabitConfig => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    (obj.mode === "do-more" || obj.mode === "do-less") &&
    isNonEmptyString(obj.frontmatterProperty) &&
    typeof obj.trackingWindowDays === "number" &&
    Number.isInteger(obj.trackingWindowDays) &&
    obj.trackingWindowDays > 0 &&
    (obj.targetScore === undefined ||
      (typeof obj.targetScore === "number" && obj.targetScore > 0))
  )
}

const assertOptionalString = (value: unknown, field: string): void => {
  if (value !== undefined && !isNonEmptyString(value)) {
    throw new Error(`app.config.json ${field} must be a non-empty string`)
  }
}

const validateParsedConfig = (parsedConfig: Record<string, unknown>): void => {
  const { obsidianVault, attachmentsDirectory, dateFormats, timezone, views, createdDateProperty, deriveTitleDate, habits } = parsedConfig

  if (!isNonEmptyString(obsidianVault)) {
    throw new Error("app.config.json requires a non-empty obsidianVault value")
  }

  assertOptionalString(attachmentsDirectory, "attachmentsDirectory")
  assertOptionalString(createdDateProperty, "createdDateProperty")

  if (dateFormats !== undefined && !isStringArray(dateFormats)) {
    throw new Error("app.config.json dateFormats must be an array of non-empty strings")
  }

  if (timezone !== undefined && (!isNonEmptyString(timezone) || !isValidTimezone(timezone))) {
    throw new Error("app.config.json timezone must be a valid IANA timezone identifier")
  }

  if (views !== undefined && (!Array.isArray(views) || !views.every(isAppConfigView))) {
    throw new Error(
      "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges/group, and filters as string records or $exclude objects",
    )
  }

  if (deriveTitleDate !== undefined && typeof deriveTitleDate !== "boolean") {
    throw new Error("app.config.json deriveTitleDate must be a boolean")
  }

  if (habits !== undefined && (!Array.isArray(habits) || !habits.every(isHabitConfig))) {
    throw new Error(
      "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), a positive integer trackingWindowDays, and an optional positive targetScore",
    )
  }
}

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new Error("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
  validateParsedConfig(parsedConfig)

  const { attachmentsDirectory, createdDateProperty, dateFormats, deriveTitleDate, habits, obsidianVault, timezone, views } = parsedConfig

  return {
    attachmentsDirectory: attachmentsDirectory as string | undefined,
    createdDateProperty: isNonEmptyString(createdDateProperty) ? createdDateProperty : undefined,
    dateFormats: dateFormats as string[] | undefined,
    deriveTitleDate: typeof deriveTitleDate === "boolean" ? deriveTitleDate : undefined,
    habits: Array.isArray(habits) && habits.every(isHabitConfig) ? habits : undefined,
    obsidianVault: obsidianVault as string,
    timezone: isNonEmptyString(timezone) ? timezone : undefined,
    views: views as AppConfigView[] | undefined,
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
    throw new Error(
      "NOTES_ROOT environment variable is required",
    )
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

import {
  isNonEmptyString,
  isStringArray,
  isStringRecord,
  isValidTimezone,
} from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  HomeStatsShowConfig,
  ResolvedNotesConfig,
} from "./types"

export type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
  HabitConfig,
  HabitMode,
  HomeStatsConfig,
  HomeStatsShowConfig,
  NotesView,
  ResolvedNotesConfig,
  ViewFilter,
} from "./types"

const APP_CONFIG_FILENAME = "app.config.json"

export class AppConfigError extends Error {}

let cachedNotesConfig: ResolvedNotesConfig | undefined

const isExcludeViewFilter = (value: unknown): value is ExcludeViewFilter => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)

  return keys.length === 1 && keys[0] === "$exclude" && isStringRecord(obj["$exclude"])
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
    isNonEmptyString(obj["id"]) &&
    isNonEmptyString(obj["name"]) &&
    isNonEmptyString(obj["component"]) &&
    (obj["badges"] === undefined || isStringArray(obj["badges"])) &&
    (obj["group"] === undefined || isNonEmptyString(obj["group"])) &&
    Array.isArray(obj["filters"]) &&
    (obj["filters"] as unknown[]).every(isViewFilter)
  )
}

const isHomeStatsConfig = (
  value: unknown,
): value is { show?: Partial<HomeStatsShowConfig> } => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  if (obj["show"] === undefined) return true
  if (obj["show"] === null || typeof obj["show"] !== "object" || Array.isArray(obj["show"])) {
    return false
  }
  const show = obj["show"] as Record<string, unknown>
  const boolKeys: (keyof HomeStatsShowConfig)[] = [
    "folderBreakdown",
    "modifiedToday",
    "notesCreated",
    "notesPerDay",
    "notesWithoutCreatedDate",
    "totalAttachments",
    "totalFolders",
    "totalNotes",
    "trends",
  ]
  return boolKeys.every(
    (key) => show[key] === undefined || typeof show[key] === "boolean",
  )
}

const isHabitConfig = (value: unknown): value is HabitConfig => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    isNonEmptyString(obj["id"]) &&
    isNonEmptyString(obj["name"]) &&
    (obj["mode"] === "do-more" || obj["mode"] === "do-less") &&
    isNonEmptyString(obj["frontmatterProperty"]) &&
    typeof obj["trackingWindowDays"] === "number" &&
    Number.isInteger(obj["trackingWindowDays"]) &&
    obj["trackingWindowDays"] > 0 &&
    (obj["targetScore"] === undefined ||
      (typeof obj["targetScore"] === "number" && obj["targetScore"] > 0))
  )
}

const DEFAULT_HOME_STATS_SHOW: HomeStatsShowConfig = {
  folderBreakdown: true,
  modifiedToday: true,
  notesCreated: true,
  notesPerDay: true,
  notesWithoutCreatedDate: true,
  totalAttachments: true,
  totalFolders: true,
  totalNotes: true,
  trends: true,
}

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new AppConfigError("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
  const attachmentsDirectory = parsedConfig["attachmentsDirectory"]
  const createdDateProperty = parsedConfig["createdDateProperty"]
  const dateFormats = parsedConfig["dateFormats"]
  const deriveTitleDate = parsedConfig["deriveTitleDate"]
  const habits = parsedConfig["habits"]
  const homeStats = parsedConfig["homeStats"]
  const obsidianVault = parsedConfig["obsidianVault"]
  const timezone = parsedConfig["timezone"]
  const views = parsedConfig["views"]

  if (!isNonEmptyString(obsidianVault)) {
    throw new AppConfigError(
      "app.config.json requires a non-empty obsidianVault value",
    )
  }

  if (
    attachmentsDirectory !== undefined &&
    !isNonEmptyString(attachmentsDirectory)
  ) {
    throw new AppConfigError(
      "app.config.json attachmentsDirectory must be a non-empty string",
    )
  }

  if (dateFormats !== undefined && !isStringArray(dateFormats)) {
    throw new AppConfigError(
      "app.config.json dateFormats must be an array of non-empty strings",
    )
  }

  if (
    timezone !== undefined &&
    (!isNonEmptyString(timezone) || !isValidTimezone(timezone))
  ) {
    throw new AppConfigError(
      "app.config.json timezone must be a valid IANA timezone identifier",
    )
  }

  if (
    views !== undefined &&
    (!Array.isArray(views) || !views.every(isAppConfigView))
  ) {
    throw new AppConfigError(
      "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges/group, and filters as string records or $exclude objects",
    )
  }

  if (createdDateProperty !== undefined && !isNonEmptyString(createdDateProperty)) {
    throw new AppConfigError(
      "app.config.json createdDateProperty must be a non-empty string",
    )
  }

  if (deriveTitleDate !== undefined && typeof deriveTitleDate !== "boolean") {
    throw new AppConfigError(
      "app.config.json deriveTitleDate must be a boolean",
    )
  }

  if (homeStats !== undefined && !isHomeStatsConfig(homeStats)) {
    throw new AppConfigError(
      "app.config.json homeStats.show must be an object with boolean values for each display section",
    )
  }

  if (
    habits !== undefined &&
    (!Array.isArray(habits) || !habits.every(isHabitConfig))
  ) {
    throw new AppConfigError(
      "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), a positive integer trackingWindowDays, and an optional positive targetScore",
    )
  }

  return {
    attachmentsDirectory,
    createdDateProperty: isNonEmptyString(createdDateProperty) ? createdDateProperty : undefined,
    dateFormats,
    deriveTitleDate: typeof deriveTitleDate === "boolean" ? deriveTitleDate : undefined,
    habits: Array.isArray(habits) && habits.every(isHabitConfig) ? habits : undefined,
    homeStats: isHomeStatsConfig(homeStats) ? homeStats : undefined,
    obsidianVault,
    timezone: isNonEmptyString(timezone) ? timezone : undefined,
    views,
  }
}

export const resolveNotesConfig = async (): Promise<ResolvedNotesConfig> => {
  if (cachedNotesConfig) {
    return cachedNotesConfig
  }

  const appConfigPath = await findAppConfigPath()
  let appConfigSource: string

  try {
    appConfigSource = await fs.readFile(appConfigPath, "utf8")
  } catch {
    throw new AppConfigError("app.config.json must be readable")
  }

  let parsedAppConfig: unknown

  try {
    parsedAppConfig = JSON.parse(appConfigSource)
  } catch {
    throw new AppConfigError("app.config.json must contain valid JSON")
  }

  const appConfig = validateAppConfig(parsedAppConfig)

  const noteRootDirectory = process.env.NOTES_ROOT?.trim()

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new AppConfigError(
      "NOTES_ROOT environment variable is required",
    )
  }

  cachedNotesConfig = {
    attachmentsDirectory: appConfig.attachmentsDirectory ?? "attachments",
    createdDateProperty: appConfig.createdDateProperty ?? "created",
    dateFormats: appConfig.dateFormats ?? [],
    deriveTitleDate: appConfig.deriveTitleDate ?? false,
    habits: appConfig.habits ?? [],
    homeStats: {
      show: { ...DEFAULT_HOME_STATS_SHOW, ...appConfig.homeStats?.show },
    },
    notesDirectory: path.resolve(noteRootDirectory),
    obsidianVault: appConfig.obsidianVault,
    timezone: appConfig.timezone ?? "UTC",
    views: appConfig.views ?? [],
  }

  return cachedNotesConfig
}

export const resolveNotesDirectory = async (): Promise<string> =>
  (await resolveNotesConfig()).notesDirectory

const findAppConfigPath = async (): Promise<string> => {
  let currentDirectory = process.cwd()

  while (currentDirectory) {
    const appConfigPath = path.join(currentDirectory, APP_CONFIG_FILENAME)
    const hasAppConfig = await fs
      .access(appConfigPath)
      .then(() => true)
      .catch(() => false)

    if (hasAppConfig) {
      return appConfigPath
    }

    const parentDirectory = path.dirname(currentDirectory)

    if (parentDirectory === currentDirectory) {
      break
    }

    currentDirectory = parentDirectory
  }

  throw new AppConfigError(
    "app.config.json is required. Copy app.config.example.json to app.config.json.",
  )
}

export const clearConfigCache = (): void => {
  cachedNotesConfig = undefined
}

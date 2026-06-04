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
  ResolvedNotesConfig,
} from "./types"

export type {
  AppConfig,
  AppConfigView,
  ExcludeViewFilter,
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
    Array.isArray(obj["filters"]) &&
    (obj["filters"] as unknown[]).every(isViewFilter)
  )
}

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new AppConfigError("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
  const attachmentsDirectory = parsedConfig["attachmentsDirectory"]
  const dateFormats = parsedConfig["dateFormats"]
  const noteRootDirectory = parsedConfig["noteRootDirectory"]
  const obsidianVault = parsedConfig["obsidianVault"]
  const timezone = parsedConfig["timezone"]
  const views = parsedConfig["views"]

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new AppConfigError(
      "app.config.json requires a non-empty noteRootDirectory value",
    )
  }

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
      "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges, and filters as string records or $exclude objects",
    )
  }

  return {
    attachmentsDirectory,
    dateFormats,
    noteRootDirectory,
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

  cachedNotesConfig = {
    attachmentsDirectory: appConfig.attachmentsDirectory ?? "attachments",
    dateFormats: appConfig.dateFormats ?? [],
    notesDirectory: path.resolve(appConfig.noteRootDirectory),
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

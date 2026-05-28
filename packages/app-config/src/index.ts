import {
  isNonEmptyString,
  isStringArray,
  isStringRecord,
  isValidTimezone,
} from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { AppConfig, AppConfigView, ResolvedNotesConfig } from "./types"

export type {
  AppConfig,
  AppConfigView,
  NotesView,
  ResolvedNotesConfig,
} from "./types"

const APP_CONFIG_FILENAME = "app.config.json"

export class AppConfigError extends Error {}

let cachedNotesConfig: ResolvedNotesConfig | undefined

const isAppConfigView = (value: unknown): value is AppConfigView =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  isNonEmptyString((value as Record<string, unknown>)["name"]) &&
  isStringRecord((value as Record<string, unknown>)["filters"])

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new AppConfigError("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
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
      "app.config.json views must be an array of objects with non-empty name and string filters",
    )
  }

  return {
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

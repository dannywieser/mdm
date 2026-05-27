import { promises as fs } from "node:fs"
import path from "node:path"

const APP_CONFIG_FILENAME = "app.config.json"

interface AppConfig {
  dateFormats?: string[]
  noteRootDirectory: string
  obsidianVault: string
}

export interface ResolvedNotesConfig {
  dateFormats: string[]
  notesDirectory: string
  obsidianVault: string
}

export class AppConfigError extends Error {}

let cachedNotesConfig: ResolvedNotesConfig | undefined

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString)

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new AppConfigError("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
  const dateFormats = parsedConfig["dateFormats"]
  const noteRootDirectory = parsedConfig["noteRootDirectory"]
  const obsidianVault = parsedConfig["obsidianVault"]

  if (!isNonEmptyString(noteRootDirectory)) {
    throw new AppConfigError(
      "app.config.json requires a non-empty noteRootDirectory value"
    )
  }

  if (!isNonEmptyString(obsidianVault)) {
    throw new AppConfigError(
      "app.config.json requires a non-empty obsidianVault value"
    )
  }

  if (dateFormats !== undefined && !isStringArray(dateFormats)) {
    throw new AppConfigError(
      "app.config.json dateFormats must be an array of non-empty strings"
    )
  }

  return { dateFormats, noteRootDirectory, obsidianVault }
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
    notesDirectory: path.resolve(
      appConfig.noteRootDirectory,
      appConfig.obsidianVault
    ),
    obsidianVault: appConfig.obsidianVault
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
    "app.config.json is required. Copy app.config.example.json to app.config.json."
  )
}

export const clearConfigCache = (): void => {
  cachedNotesConfig = undefined
}

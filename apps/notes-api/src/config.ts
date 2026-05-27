import { promises as fs } from "node:fs"
import path from "node:path"

const APP_CONFIG_FILENAME = "app.config.json"

interface AppConfig {
  noteRootDirectory: string
  obsidianVault: string
}

export class AppConfigError extends Error {}

let cachedNotesDirectory: string | undefined

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0

const validateAppConfig = (appConfig: unknown): AppConfig => {
  if (!appConfig || typeof appConfig !== "object") {
    throw new AppConfigError("app.config.json must be a JSON object")
  }

  const parsedConfig = appConfig as Record<string, unknown>
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

  return { noteRootDirectory, obsidianVault }
}

export const resolveNotesDirectory = async (): Promise<string> => {
  if (cachedNotesDirectory) {
    return cachedNotesDirectory
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

  cachedNotesDirectory = path.resolve(
    appConfig.noteRootDirectory,
    appConfig.obsidianVault
  )

  return cachedNotesDirectory
}

const findAppConfigPath = async (): Promise<string> => {
  let currentDirectory = process.cwd()

  while (true) {
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
      throw new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json."
      )
    }

    currentDirectory = parentDirectory
  }
}

export const clearConfigCache = (): void => {
  cachedNotesDirectory = undefined
}

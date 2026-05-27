import { promises as fs } from "node:fs"
import path from "node:path"

const APP_CONFIG_PATH = path.resolve(__dirname, "../../../app.config.json")

interface AppConfig {
  noteRootDirectory: string
  obsidianVault: string
}

export class AppConfigError extends Error {}

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
  let appConfigSource: string

  try {
    appConfigSource = await fs.readFile(APP_CONFIG_PATH, "utf8")
  } catch (error) {
    throw new AppConfigError(
      "app.config.json is required. Copy app.config.example.json to app.config.json."
    )
  }

  let parsedAppConfig: unknown

  try {
    parsedAppConfig = JSON.parse(appConfigSource)
  } catch (error) {
    throw new AppConfigError("app.config.json must contain valid JSON")
  }

  const appConfig = validateAppConfig(parsedAppConfig)

  return path.resolve(appConfig.noteRootDirectory, appConfig.obsidianVault)
}

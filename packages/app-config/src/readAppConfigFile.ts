import { promises as fs } from "node:fs"
import path from "node:path"

import { AppConfigError } from "./AppConfigError"

const APP_CONFIG_FILENAME = "app.config.json"

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

/**
 * Locates app.config.json by searching upward from the current working
 * directory, then reads and parses it as JSON.
 *
 * @returns The parsed contents of app.config.json.
 */
export const readAppConfigFile = async (): Promise<unknown> => {
  const appConfigPath = await findAppConfigPath()
  let appConfigSource: string

  try {
    appConfigSource = await fs.readFile(appConfigPath, "utf8")
  } catch {
    throw new AppConfigError("app.config.json must be readable")
  }

  try {
    return JSON.parse(appConfigSource)
  } catch {
    throw new AppConfigError("app.config.json must contain valid JSON")
  }
}

import { promises as fs } from "node:fs"
import path from "node:path"

import { AppConfigError } from "./AppConfigError"

const APP_CONFIG_FILENAME = "app.config.json"

export const readAppConfigFile = async (): Promise<unknown> => {
  const appConfigPath = path.join(process.cwd(), APP_CONFIG_FILENAME)
  let appConfigSource: string

  try {
    appConfigSource = await fs.readFile(appConfigPath, "utf8")
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new AppConfigError(
        "app.config.json is required. Copy app.config.example.json to app.config.json.",
      )
    }
    throw new AppConfigError("app.config.json must be readable")
  }

  try {
    return JSON.parse(appConfigSource)
  } catch {
    throw new AppConfigError("app.config.json must contain valid JSON")
  }
}

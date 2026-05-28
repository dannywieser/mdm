import { isNonEmptyString } from "mdm-util"
import { promises as fs } from "node:fs"
import path from "node:path"

import type { FlagDefinition } from "./handlers/flags/flags.types"

const APP_CONFIG_FILENAME = "app.config.json"

export class FlagConfigError extends Error {}

const isValidFlagDefinition = (value: unknown): value is FlagDefinition => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const expiresInSeconds = (value as Record<string, unknown>)["expiresInSeconds"]

  return (
    expiresInSeconds === undefined ||
    (Number.isInteger(expiresInSeconds) && Number(expiresInSeconds) > 0)
  )
}

const validateFlagDefinitions = (
  rawFlagDefinitions: unknown,
): Record<string, FlagDefinition> => {
  if (!rawFlagDefinitions || typeof rawFlagDefinitions !== "object") {
    throw new FlagConfigError(
      "app.config.json flags must be an object keyed by flag name",
    )
  }

  const flagEntries = Object.entries(
    rawFlagDefinitions as Record<string, unknown>,
  )
  const hasInvalidEntry = flagEntries.some(
    ([flagName, definition]) =>
      !isNonEmptyString(flagName) || !isValidFlagDefinition(definition),
  )

  if (hasInvalidEntry) {
    throw new FlagConfigError(
      "app.config.json flags must map non-empty flag names to definitions with optional positive integer expiresInSeconds",
    )
  }

  return Object.fromEntries(flagEntries) as Record<string, FlagDefinition>
}

export const resolveFlagDefinitions = async (): Promise<
  Record<string, FlagDefinition>
> => {
  const appConfigPath = await findAppConfigPath()
  let appConfigSource: string

  try {
    appConfigSource = await fs.readFile(appConfigPath, "utf8")
  } catch {
    throw new FlagConfigError("app.config.json must be readable")
  }

  let parsedAppConfig: unknown

  try {
    parsedAppConfig = JSON.parse(appConfigSource)
  } catch {
    throw new FlagConfigError("app.config.json must contain valid JSON")
  }

  if (!parsedAppConfig || typeof parsedAppConfig !== "object") {
    throw new FlagConfigError("app.config.json must be a JSON object")
  }

  const flags = (parsedAppConfig as Record<string, unknown>)["flags"]

  return validateFlagDefinitions(flags)
}

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

  throw new FlagConfigError(
    "app.config.json is required. Copy app.config.example.json to app.config.json.",
  )
}

import { AppConfigError, readAppConfigFile } from "app-config"
import { isNonEmptyString } from "mdm-util"

import type { FlagDefinition } from "./handlers/flags/flags.types"

export class FlagConfigError extends Error {}

const isValidFlagDefinition = (value: unknown): value is FlagDefinition => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const expiresInDays = (value as Record<string, unknown>)["expiresInDays"]

  return (
    expiresInDays === undefined ||
    (Number.isInteger(expiresInDays) && Number(expiresInDays) > 0)
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
      "app.config.json flags must map non-empty flag names to definitions with optional positive integer expiresInDays",
    )
  }

  return Object.fromEntries(flagEntries) as Record<string, FlagDefinition>
}

export const resolveFlagDefinitions = async (): Promise<
  Record<string, FlagDefinition>
> => {
  let parsedAppConfig: unknown

  try {
    parsedAppConfig = await readAppConfigFile()
  } catch (error) {
    throw error instanceof AppConfigError
      ? new FlagConfigError(error.message)
      : error
  }

  if (!parsedAppConfig || typeof parsedAppConfig !== "object") {
    throw new FlagConfigError("app.config.json must be a JSON object")
  }

  const flags = (parsedAppConfig as Record<string, unknown>)["flags"]

  return validateFlagDefinitions(flags)
}

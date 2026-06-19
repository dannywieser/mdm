import { isNonEmptyString, isStringArray, isValidTimezone } from "mdm-util"

import type { AppConfig } from "../types"

import { validateHabits } from "../habits/habits"
import { validateViews } from "../views/views"

const validateObsidianVault = (value: unknown): string => {
  if (!isNonEmptyString(value)) {
    throw new Error("app.config.json requires a non-empty obsidianVault value")
  }
  return value
}

const validateDateFormats = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined
  if (!isStringArray(value)) {
    throw new Error("app.config.json dateFormats must be an array of non-empty strings")
  }
  return value
}

const validateTimezone = (value: unknown): string | undefined => {
  if (value === undefined) return undefined
  if (!isNonEmptyString(value) || !isValidTimezone(value)) {
    throw new Error("app.config.json timezone must be a valid IANA timezone identifier")
  }
  return value
}

export const validateAppConfig = (raw: unknown): AppConfig => {
  if (!raw || typeof raw !== "object") {
    throw new Error("app.config.json must be a JSON object")
  }

  const config = raw as Record<string, unknown>

  const obsidianVault = validateObsidianVault(config.obsidianVault)
  const dateFormats = validateDateFormats(config.dateFormats)
  const timezone = validateTimezone(config.timezone)
  const habits = validateHabits(config.habits)
  const views = validateViews(config.views)

  return { dateFormats, habits, obsidianVault, timezone, views }
}

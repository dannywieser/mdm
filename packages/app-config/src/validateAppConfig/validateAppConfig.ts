import { isNonEmptyString, isStringArray, isValidTimezone } from "mdm-util"

import type { AppConfig, NotesSource } from "../types"

import { validateHabits } from "../habits/habits"
import { resolveTransactions } from "../transactions/transactions"
import { validateViews } from "../views/views"

const NOTES_SOURCES: NotesSource[] = ["bear", "obsidian"]

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

const validateAttachmentsDirectory = (value: unknown): string | undefined => {
  if (value === undefined) return undefined
  if (!isNonEmptyString(value)) {
    throw new Error("app.config.json attachmentsDirectory must be a non-empty string")
  }
  return value
}

const validateNotesSource = (value: unknown): NotesSource | undefined => {
  if (value === undefined) return undefined
  if (typeof value !== "string" || !NOTES_SOURCES.includes(value as NotesSource)) {
    throw new Error(
      `app.config.json notesSource must be one of: ${NOTES_SOURCES.join(", ")}`,
    )
  }
  return value as NotesSource
}

export const validateAppConfig = (raw: unknown): AppConfig => {
  if (!raw || typeof raw !== "object") {
    throw new Error("app.config.json must be a JSON object")
  }

  const config = raw as Record<string, unknown>

  const obsidianVault = validateObsidianVault(config.obsidianVault)
  const attachmentsDirectory = validateAttachmentsDirectory(config.attachmentsDirectory)
  const dateFormats = validateDateFormats(config.dateFormats)
  const timezone = validateTimezone(config.timezone)
  const habits = validateHabits(config.habits)
  const views = validateViews(config.views)
  const notesSource = validateNotesSource(config.notesSource)
  const transactions = resolveTransactions(config.transactions)

  return {
    attachmentsDirectory,
    dateFormats,
    habits,
    notesSource,
    obsidianVault,
    timezone,
    transactions,
    views,
  }
}

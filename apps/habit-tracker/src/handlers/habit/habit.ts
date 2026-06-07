import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { AppConfigError, resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"

import type { HabitResult } from "./habit.types"

import { collectMarkdownFiles, scanHabitEntries } from "./habit.files"
import { buildHistory, buildStreaks, calculateHabitScore } from "./habit.util"

export const habitHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { createdDateProperty, dateFormats, deriveTitleDate, habits, notesDirectory, timezone } =
      notesConfig

    const habitId = String(request.params["id"])
    const habitConfig = habits.find((h) => h.id === habitId)

    if (!habitConfig) {
      response.status(404).json({ error: `Habit not found: ${habitId}` })
      return
    }

    const { id, name, mode, frontmatterProperty, trackingWindowDays } = habitConfig

    console.log("[habit] config resolved", {
      habitId: id,
      frontmatterProperty,
      mode,
      trackingWindowDays,
      createdDateProperty,
      deriveTitleDate,
      notesDirectory,
    })

    const filePaths = await collectMarkdownFiles(notesDirectory)
    console.log(`[habit] collectMarkdownFiles found ${filePaths.length} file(s) in ${notesDirectory}`)

    const entries = await scanHabitEntries(
      filePaths,
      frontmatterProperty,
      createdDateProperty,
      deriveTitleDate,
      dateFormats,
    )
    console.log(`[habit] scanHabitEntries matched ${entries.length} entr${entries.length === 1 ? "y" : "ies"} for "${frontmatterProperty}"`)

    const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone })
    const {
      habitScore,
      streak,
      uniqueWindowDays,
      windowStart,
      rawScore,
      scoreBeforeMultipliers,
      streakMultiplier,
      dayMultiplier,
      recentEntryAdditions,
    } = calculateHabitScore(entries, today, trackingWindowDays, mode)

    const history = buildHistory(entries, trackingWindowDays, mode, today)
    const streaks = buildStreaks(entries, mode)

    const allTimeHighScore = history.reduce((max, h) => Math.max(max, h.habitScore), 0)
    const allTimeHighStreak = streaks.reduce((max, s) => Math.max(max, s.length), 0)
    const allTimeHighWindowEntries = history.reduce((max, h) => Math.max(max, h.windowEntries), 0)

    const result: HabitResult = {
      allTimeHighScore,
      allTimeHighStreak,
      allTimeHighWindowEntries,
      habitId: id,
      habitName: name,
      history,
      habitScore,
      streak,
      streaks,
      windowEntries: uniqueWindowDays,
      windowStart,
      rawScore,
      scoreBeforeMultipliers,
      streakMultiplier,
      dayMultiplier,
      recentEntryAdditions,
    }

    response.status(200).json(result)
  } catch (error) {
    if (error instanceof AppConfigError) {
      response.status(500).json({ error: error.message })
      return
    }
    console.error("Unable to load habit", {
      error: toLoggableError(error),
      notesConfig: notesConfig ?? null,
    })
    response.status(500).json({ error: "Unable to load habit" })
  }
}

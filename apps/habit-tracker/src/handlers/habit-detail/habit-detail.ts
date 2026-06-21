import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import type { HabitResult } from "./habit-detail.types"

import { logger } from "../../logger"
import { scanHabitEntries } from "./habit-detail.files"
import { buildHistory, buildScoreBreakdown, buildScoreEntries, buildStreaks, calculateHabitScore, calculateLowestDaysTrackedPerPeriod, getWindowEntries } from "./habit-detail.util"

export const habitDetailHandler: RequestHandler = async (request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { habits, notesDirectory, timezone } = notesConfig

    const habitId = String(request.params.id)
    const habitConfig = habits.find((h) => h.id === habitId)

    if (!habitConfig) {
      response.status(404).json({ error: `Habit not found: ${habitId}` })
      return
    }

    const { id, name, mode, frontmatterProperty, targetScore, trackingWindowDays } = habitConfig

    logger.debug({
      frontmatterProperty,
      habitId: id,
      mode,
      notesDirectory,
      trackingWindowDays,
    }, "[habit] config resolved")

    const filePaths = await collectMarkdownFiles(notesDirectory)
    logger.debug({ count: filePaths.length, notesDirectory }, "[habit] collectMarkdownFiles found files")

    const entries = await scanHabitEntries(filePaths, frontmatterProperty)
    logger.debug({ count: entries.length, frontmatterProperty }, "[habit] scanHabitEntries matched entries")

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
    const scoreEntries = buildScoreEntries(getWindowEntries(entries, today, trackingWindowDays), today)
    const scoreBreakdown = buildScoreBreakdown(scoreBeforeMultipliers, dayMultiplier, streakMultiplier, uniqueWindowDays, streak)

    const allTimeHighScore = history.reduce((max, h) => Math.max(max, h.habitScore), 0)
    const allTimeHighStreak = streaks.reduce((max, s) => Math.max(max, s.length), 0)
    const allTimeHighWindowEntries = history.reduce((max, h) => Math.max(max, h.windowEntries), 0)
    const lowestDaysTrackedPerPeriod = mode === "do-less"
      ? calculateLowestDaysTrackedPerPeriod(entries, today, trackingWindowDays)
      : undefined

    const result: HabitResult = {
      allTimeHighScore,
      allTimeHighStreak,
      allTimeHighWindowEntries,
      habitId: id,
      habitName: name,
      history,
      habitScore,
      lowestDaysTrackedPerPeriod,
      mode,
      scoreBreakdown,
      scoreEntries,
      streak,
      streaks,
      targetScore,
      trackingWindowDays,
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
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load habit",
    )
    response.status(500).json({ error: "Unable to load habit" })
  }
}

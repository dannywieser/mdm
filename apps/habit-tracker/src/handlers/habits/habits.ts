import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"
import type { ScannedNote } from "markdown"

import { resolveNotesConfig } from "app-config"
import { collectMarkdownFiles } from "markdown"
import { toLoggableError } from "mdm-util"

import type { HabitEntry } from "../habit-detail/habit-detail.types"
import type { HabitSummary } from "./habits.types"

import { logger } from "../../logger"
import { loadBearNotes } from "../../redis/loadBearNotes"
import { scanHabitEntriesFromNotes } from "../habit-detail/habit-detail.bear"
import { scanHabitEntries } from "../habit-detail/habit-detail.files"
import { calculateHabitScore } from "../habit-detail/habit-detail.util"

export const habitsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { createdDateProperty, dateFormats, habits, notesDirectory, notesSource, timezone } = notesConfig

    const filePaths = notesSource === "obsidian" ? await collectMarkdownFiles(notesDirectory) : []
    const bearNotes: ScannedNote[] = notesSource === "bear" ? await loadBearNotes() : []
    const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone })

    const loadEntries = (frontmatterProperty: string): Promise<HabitEntry[]> =>
      notesSource === "bear"
        ? Promise.resolve(
          scanHabitEntriesFromNotes(bearNotes, frontmatterProperty, createdDateProperty, dateFormats),
        )
        : scanHabitEntries(filePaths, frontmatterProperty)

    const summaries: HabitSummary[] = await Promise.all(
      habits.map(async ({ id, name, mode, frontmatterProperty, scoring, targetScore, trackingWindowDays }) => {
        const entries = await loadEntries(frontmatterProperty)
        const { habitScore, streak, uniqueWindowDays } = calculateHabitScore(
          entries,
          today,
          trackingWindowDays,
          mode,
          scoring,
        )

        return {
          habitId: id,
          habitName: name,
          habitScore,
          mode,
          streak,
          targetScore,
          windowEntries: uniqueWindowDays,
        }
      }),
    )

    response.status(200).json(summaries)
  } catch (error) {
    logger.error(
      { error: toLoggableError(error), notesConfig: notesConfig ?? null },
      "Unable to load habits",
    )
    response.status(500).json({ error: "Unable to load habits" })
  }
}

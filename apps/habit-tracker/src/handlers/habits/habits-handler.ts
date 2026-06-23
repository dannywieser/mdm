import type { ResolvedNotesConfig } from "app-config"
import type { RequestHandler } from "express"

import { resolveNotesConfig } from "app-config"
import { toLoggableError } from "mdm-util"
import { HabitSummary } from "services"

import { logger } from "../../logger"
import { calculateHabitScore } from "../habit-detail/habit-detail.util"
import { loadHabitEntries } from "./loadHabitEntries"

export const habitsHandler: RequestHandler = async (_request, response) => {
  let notesConfig: ResolvedNotesConfig | undefined

  try {
    notesConfig = await resolveNotesConfig()
    const { habits, notesDirectory, timezone, dateFormats } = notesConfig
    const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone })

    const summaries: HabitSummary[] = await Promise.all(
      habits.map(
        async ({
          id,
          name,
          mode,
          frontmatterProperty,
          targetScore,
          trackingWindowDays,
        }) => {
          const entries = await loadHabitEntries(
            notesDirectory,
            frontmatterProperty,
            dateFormats,
          )

          const { habitScore, streak, uniqueWindowDays } = calculateHabitScore(
            entries,
            today,
            trackingWindowDays,
            mode,
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
        },
      ),
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

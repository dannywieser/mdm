import { promises as fs } from "node:fs"
import path from "node:path"

import type {
  BuildSnapshotOptions,
  SnapshotHabitSummary,
  SnapshotSummary,
  SnapshotViewsPayload,
} from "./snapshot.types"

import { fetchJson } from "./fetchJson"

const writeJson = async (
  outputDirectory: string,
  fileName: string,
  payload: unknown,
): Promise<void> => {
  await fs.writeFile(
    path.join(outputDirectory, fileName),
    JSON.stringify(payload),
    "utf8",
  )
}

const snapshotView = async (
  notesBaseUrl: string,
  outputDirectory: string,
  viewId: string,
): Promise<void> => {
  const encodedView = encodeURIComponent(viewId)
  const full = await fetchJson<unknown>(`${notesBaseUrl}/notes?view=${encodedView}`)
  const slim = await fetchJson<unknown>(
    `${notesBaseUrl}/notes?view=${encodedView}&includeContent=false`,
  )

  await writeJson(outputDirectory, `notes.${viewId}.json`, full)
  await writeJson(outputDirectory, `notes.${viewId}.slim.json`, slim)
}

/**
 * Captures the responses of the running notes-api and habit-tracker services
 * as static JSON files, plus the vault attachments (cover images), producing
 * everything the web app needs to run without servers.
 */
export const buildSnapshot = async ({
  attachmentsSourceDirectory,
  habitsBaseUrl,
  notesBaseUrl,
  outputDirectory,
}: BuildSnapshotOptions): Promise<SnapshotSummary> => {
  await fs.rm(outputDirectory, { force: true, recursive: true })
  await fs.mkdir(outputDirectory, { recursive: true })

  const viewsPayload = await fetchJson<SnapshotViewsPayload>(`${notesBaseUrl}/views`)
  await writeJson(outputDirectory, "views.json", viewsPayload)

  for (const view of viewsPayload.views) {
    await snapshotView(notesBaseUrl, outputDirectory, view.id)
  }

  const stats = await fetchJson<unknown>(`${notesBaseUrl}/stats`)
  await writeJson(outputDirectory, "stats.json", stats)

  const habits = await fetchJson<SnapshotHabitSummary[]>(`${habitsBaseUrl}/habits`)
  await writeJson(outputDirectory, "habits.json", habits)

  for (const habit of habits) {
    const detail = await fetchJson<unknown>(
      `${habitsBaseUrl}/habits/${encodeURIComponent(habit.habitId)}`,
    )
    await writeJson(outputDirectory, `habit.${habit.habitId}.json`, detail)
  }

  await fs.cp(
    attachmentsSourceDirectory,
    path.join(outputDirectory, "images", "attachments"),
    { recursive: true },
  )

  return { habitCount: habits.length, viewCount: viewsPayload.views.length }
}

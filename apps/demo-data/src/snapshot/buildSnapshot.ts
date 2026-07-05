import { promises as fs } from "node:fs"
import path from "node:path"

import type {
  BuildSnapshotOptions,
  SnapshotHabitSummary,
  SnapshotNotesPayload,
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

const FILE_SAFE_ID_PATTERN = /^[A-Za-z0-9_-]+$/

/**
 * Snapshot filenames embed view/habit ids verbatim, and static hosts decode
 * request URLs before resolving files — so ids must be URL-safe as-is or the
 * files written here would never match the URLs the demo hooks request.
 */
const assertFileSafeId = (kind: string, id: string): string => {
  if (!FILE_SAFE_ID_PATTERN.test(id)) {
    throw new Error(
      `${kind} id "${id}" cannot be used in a demo snapshot filename; use only letters, numbers, hyphens, and underscores`,
    )
  }
  return id
}

const snapshotView = async (
  notesBaseUrl: string,
  outputDirectory: string,
  viewId: string,
): Promise<void> => {
  const safeViewId = assertFileSafeId("View", viewId)
  const full = await fetchJson<unknown>(`${notesBaseUrl}/notes?view=${safeViewId}`)
  const slim = await fetchJson<unknown>(
    `${notesBaseUrl}/notes?view=${safeViewId}&includeContent=false`,
  )

  await writeJson(outputDirectory, `notes.${safeViewId}.json`, full)
  await writeJson(outputDirectory, `notes.${safeViewId}.slim.json`, slim)
}

/**
 * Copies every note's raw markdown file to `source/<note.id>.md` so the demo
 * can show note source in the browser where the Obsidian deep link would
 * normally open the vault.
 */
const copyNoteSources = async (
  notesBaseUrl: string,
  outputDirectory: string,
): Promise<number> => {
  const sourceDirectory = path.join(outputDirectory, "source")
  await fs.mkdir(sourceDirectory, { recursive: true })

  const { notes } = await fetchJson<SnapshotNotesPayload>(
    `${notesBaseUrl}/notes?includeContent=false`,
  )

  for (const note of notes) {
    const safeNoteId = assertFileSafeId("Note", note.id)
    const contents = await fs.readFile(note.fullPath, "utf8")
    await fs.writeFile(path.join(sourceDirectory, `${safeNoteId}.md`), contents, "utf8")
  }

  return notes.length
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

  const habits = await fetchJson<SnapshotHabitSummary[]>(`${habitsBaseUrl}/habits`)
  await writeJson(outputDirectory, "habits.json", habits)

  for (const habit of habits) {
    const safeHabitId = assertFileSafeId("Habit", habit.habitId)
    const detail = await fetchJson<unknown>(`${habitsBaseUrl}/habits/${safeHabitId}`)
    await writeJson(outputDirectory, `habit.${safeHabitId}.json`, detail)
  }

  const noteCount = await copyNoteSources(notesBaseUrl, outputDirectory)

  await fs.cp(
    attachmentsSourceDirectory,
    path.join(outputDirectory, "images", "attachments"),
    { recursive: true },
  )

  return { habitCount: habits.length, noteCount, viewCount: viewsPayload.views.length }
}

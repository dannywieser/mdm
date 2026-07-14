import { resolveNotesConfig } from "app-config"

import type { ScannedNote } from "../notes/notes.types"
import type { ViewSummary } from "./views.types"

import { applyViewFilter } from "../notes/filters/notes.filters"

export const buildViews = async (
  notes: readonly ScannedNote[],
): Promise<ViewSummary[]> => {
  const { views } = await resolveNotesConfig()
  return Promise.all(
    views.map(async (view) => {
      const matchedNotes = await applyViewFilter(notes, view.id)
      return {
        badges: view.badges,
        component: view.component,
        count: matchedNotes.length,
        group: view.group,
        id: view.id,
        name: view.name,
        noteIds: matchedNotes.map((note) => note.id),
      }
    }),
  )
}

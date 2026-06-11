import type { NotesView } from "app-config"

import type { ViewFilterContext } from "../notes/filters/notes.filters.types"
import type { ScannedNote } from "../notes/notes.types"
import type { ViewSummary } from "./views.types"

import { applyViewFilter } from "../notes/filters/notes.filters"

export const buildViews = (
  notes: readonly ScannedNote[],
  views: readonly NotesView[],
  context: ViewFilterContext,
): ViewSummary[] =>
  views.map((view) => {
    const matchedNotes = applyViewFilter(notes, views, view.id, context)

    return {
      aspectRatio: view.aspectRatio,
      badges: view.badges,
      component: view.component,
      count: matchedNotes.length,
      group: view.group,
      id: view.id,
      layout: view.layout,
      name: view.name,
      noteIds: matchedNotes.map((note) => note.id),
    }
  })

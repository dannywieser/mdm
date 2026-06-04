import type { NotesView } from "app-config"

import { getDateComponents } from "mdm-util"

import type { ViewFilterContext } from "../notes/filters/notes.filters.types"
import type { ScannedNote } from "../notes/notes.types"
import type { StatsViewCount } from "./stats.types"

import { applyViewFilter } from "../notes/filters/notes.filters"

export const countModifiedToday = (
  notes: readonly ScannedNote[],
  timezone: string,
): number => {
  const today = getDateComponents(new Date(), timezone)
  return notes.filter((note) => {
    const modified = getDateComponents(new Date(note.modifiedDate), timezone)
    return (
      modified.year === today.year &&
      modified.month === today.month &&
      modified.day === today.day
    )
  }).length
}

export const buildViewCounts = (
  notes: readonly ScannedNote[],
  views: readonly NotesView[],
  context: ViewFilterContext,
): StatsViewCount[] =>
  views.map((view) => ({
    aspectRatio: view.aspectRatio,
    badges: view.badges,
    component: view.component,
    count: applyViewFilter(notes, views, view.id, context).length,
    id: view.id,
    name: view.name,
  }))

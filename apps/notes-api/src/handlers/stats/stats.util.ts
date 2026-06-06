import type { NotesView } from "app-config"

import { getDateComponents } from "mdm-util"

import type { ViewFilterContext } from "../notes/filters/notes.filters.types"
import type { ScannedNote } from "../notes/notes.types"
import type {
  FolderCount,
  NotePerDay,
  NotesCreatedStats,
  StatsTrends,
  StatsViewCount,
} from "./stats.types"

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
    layout: view.layout,
    name: view.name,
  }))

export const countFolders = (notes: readonly ScannedNote[]): number =>
  new Set(notes.map((note) => note.folder)).size

export const buildFolderBreakdown = (
  notes: readonly ScannedNote[],
): FolderCount[] => {
  const counts = new Map<string, number>()
  for (const note of notes) {
    counts.set(note.folder, (counts.get(note.folder) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([folder, count]) => ({ count, folder }))
    .sort((a, b) => b.count - a.count || a.folder.localeCompare(b.folder))
}

const toDateString = (date: Date, timezone: string): string => {
  const { year, month, day } = getDateComponents(date, timezone)
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const countNotesCreatedSince = (
  notes: readonly ScannedNote[],
  days: number,
  now: Date,
): number => {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return notes.filter((note) => new Date(note.createdDate) >= cutoff).length
}

const countNotesCreatedInRange = (
  notes: readonly ScannedNote[],
  olderDays: number,
  newerDays: number,
  now: Date,
): number => {
  const olderCutoff = new Date(now)
  olderCutoff.setDate(olderCutoff.getDate() - olderDays)
  const newerCutoff = new Date(now)
  newerCutoff.setDate(newerCutoff.getDate() - newerDays)
  return notes.filter((note) => {
    const created = new Date(note.createdDate)
    return created >= olderCutoff && created < newerCutoff
  }).length
}

export const buildNotesCreated = (
  notes: readonly ScannedNote[],
  now: Date,
): NotesCreatedStats => ({
  last30Days: countNotesCreatedSince(notes, 30, now),
  last365Days: countNotesCreatedSince(notes, 365, now),
  last90Days: countNotesCreatedSince(notes, 90, now),
})

export const buildTrends = (
  notes: readonly ScannedNote[],
  now: Date,
): StatsTrends => {
  const current = countNotesCreatedSince(notes, 30, now)
  const previous = countNotesCreatedInRange(notes, 60, 30, now)
  const changePercent =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : Math.round(((current - previous) / previous) * 100)
  return {
    changePercent,
    notesLast30Days: current,
    notesPrevious30Days: previous,
  }
}

export const buildNotesPerDay = (
  notes: readonly ScannedNote[],
  timezone: string,
  now: Date,
): NotePerDay[] => {
  const counts = new Map<string, number>()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    counts.set(toDateString(date, timezone), 0)
  }

  for (const note of notes) {
    const dateStr = toDateString(new Date(note.createdDate), timezone)
    const current = counts.get(dateStr)
    if (current !== undefined) {
      counts.set(dateStr, current + 1)
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ count, date }))
}

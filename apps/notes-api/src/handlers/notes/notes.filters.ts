import type { NotesView } from "app-config"
import type { Note } from "markdown"
import { parseDateFromFormats } from "markdown"
import { getDateComponents } from "mdm-util"

import type { ViewFilterContext } from "./notes.filters.types"

const ON_THIS_DAY = "$onThisDay"

const matchesOnThisDay = (
  noteValue: unknown,
  context: ViewFilterContext,
): boolean => {
  const today = getDateComponents(new Date(), context.timezone)

  if (typeof noteValue === "string") {
    const date = new Date(noteValue)
    if (isNaN(date.getTime())) return false
    const { day, month, year } = getDateComponents(date, context.timezone)
    return month === today.month && day === today.day && year < today.year
  }

  if (Array.isArray(noteValue)) {
    return (noteValue as unknown[]).some((entry) => {
      if (typeof entry !== "string") return false
      const parsed = parseDateFromFormats(entry, context.dateFormats)
      if (!parsed) return false
      return (
        parsed.month === today.month &&
        parsed.day === today.day &&
        parsed.year < today.year
      )
    })
  }

  return false
}

const getObjectValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== "object") {
    return undefined
  }

  return (value as Record<string, unknown>)[key]
}

const getValueByPath = (note: Note, filterPath: string): unknown =>
  filterPath
    .split(".")
    .filter((segment) => segment.length > 0)
    .reduce<unknown>((value, segment) => getObjectValue(value, segment), note)

const isMatchingFilterValue = (
  noteValue: unknown,
  expectedValue: string,
  context: ViewFilterContext,
): boolean => {
  if (expectedValue === ON_THIS_DAY) {
    return matchesOnThisDay(noteValue, context)
  }

  if (typeof noteValue === "string") {
    return noteValue === expectedValue
  }

  if (Array.isArray(noteValue)) {
    return noteValue.includes(expectedValue)
  }

  return false
}

const matchesViewFilters = (
  note: Note,
  filters: Record<string, string>,
  context: ViewFilterContext,
): boolean =>
  Object.entries(filters).every(([filterPath, expectedValue]) =>
    isMatchingFilterValue(
      getValueByPath(note, filterPath),
      expectedValue,
      context,
    ),
  )

export const applyViewFilter = (
  notes: readonly Note[],
  configuredViews: readonly NotesView[],
  requestedViewName: string | undefined,
  context: ViewFilterContext = { dateFormats: [], timezone: "UTC" },
): Note[] => {
  if (!requestedViewName) {
    return [...notes]
  }

  const selectedView = configuredViews.find(
    ({ name }) => name === requestedViewName,
  )

  if (!selectedView) {
    return [...notes]
  }

  return notes.filter((note) =>
    matchesViewFilters(note, selectedView.filters, context),
  )
}

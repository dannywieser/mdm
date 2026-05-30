import type { NotesView } from "app-config"

import {
  getDateComponents,
  getValueByPath,
  parseDateFromFormats,
} from "mdm-util"

import type { ViewFilterContext } from "./notes.filters.types"

const ON_THIS_DAY = "$onThisDay"

type FilterableNote = {
  basename: string
}

const matchesOnThisDay = (
  noteValue: unknown,
  context: ViewFilterContext,
): boolean => {
  const today = getDateComponents(new Date(), context.timezone)
  if (typeof noteValue === "string") {
    const date = new Date(noteValue)

    if (isNaN(date.getTime())) {
      return false
    }

    const { day, month, year } = getDateComponents(date, context.timezone)

    return month === today.month && day === today.day && year < today.year
  }

  if (Array.isArray(noteValue)) {
    return (noteValue as unknown[]).some((entry) => {
      if (typeof entry !== "string") {
        return false
      }

      const parsed = parseDateFromFormats(entry, context.dateFormats)

      if (!parsed) {
        return false
      }

      return (
        parsed.month === today.month &&
        parsed.day === today.day &&
        parsed.year < today.year
      )
    })
  }

  return false
}

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

const matchesViewFilters = <T extends FilterableNote>(
  note: T,
  filters: Record<string, string>,
  context: ViewFilterContext,
): boolean =>
  Object.entries(filters).every(([filterPath, expectedValue]) => {
    const noteValue = getValueByPath(note, filterPath)
    const matches = isMatchingFilterValue(noteValue, expectedValue, context)
    return matches
  })

export const applyViewFilter = <T extends FilterableNote>(
  notes: readonly T[],
  configuredViews: readonly NotesView[],
  requestedViewName: string | undefined,
  context: ViewFilterContext = { dateFormats: [], timezone: "UTC" },
): T[] => {
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

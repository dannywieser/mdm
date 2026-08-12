import type { ExcludeViewFilter, ViewFilter } from "app-config"
import type { DateComponents } from "mdm-util"

import { resolveNotesConfig } from "app-config"
import {
  getDateComponents,
  getValueByPath,
  parseDateFromFormats,
} from "mdm-util"

import type { ViewFilterContext } from "./notes.filters.types"

import { MISSING, ON_THIS_DAY, TODAY } from "./constants"

interface FilterableNote {
  basename: string
}

/**
 * Parses one entry of a date array field. Tries the configured dateFormats
 * first (dates embedded in note text, e.g. "2026.05.26"), then falls back
 * to native Date/ISO parsing (e.g. a note's modifiedDate/creationDate) —
 * both kinds of value can appear side by side in a note's `dates` array.
 */
const parseArrayDateEntry = (
  entry: unknown,
  context: ViewFilterContext,
): DateComponents | null => {
  if (typeof entry !== "string") {
    return null
  }

  const formatMatch = parseDateFromFormats(entry, context.dateFormats)

  if (formatMatch) {
    return formatMatch
  }

  const isoDate = new Date(entry)

  if (isNaN(isoDate.getTime())) {
    return null
  }

  return getDateComponents(isoDate, context.timezone)
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
      const parsed = parseArrayDateEntry(entry, context)

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

const matchesToday = (
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

    return year === today.year && month === today.month && day === today.day
  }

  if (Array.isArray(noteValue)) {
    return (noteValue as unknown[]).some((entry) => {
      const parsed = parseArrayDateEntry(entry, context)

      if (!parsed) {
        return false
      }

      return (
        parsed.year === today.year &&
        parsed.month === today.month &&
        parsed.day === today.day
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
  if (expectedValue === MISSING) {
    return noteValue === undefined || noteValue === null
  }

  if (expectedValue === ON_THIS_DAY) {
    return matchesOnThisDay(noteValue, context)
  }

  if (expectedValue === TODAY) {
    return matchesToday(noteValue, context)
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
  note: FilterableNote,
  filters: Record<string, string>,
  context: ViewFilterContext,
): boolean =>
  Object.entries(filters).every(([filterPath, expectedValue]) => {
    const noteValue = getValueByPath(note, filterPath)
    const matches = isMatchingFilterValue(noteValue, expectedValue, context)
    return matches
  })

const isExcludeViewFilter = (filter: ViewFilter): filter is ExcludeViewFilter =>
  "$exclude" in filter &&
  typeof filter.$exclude === "object" &&
  !Array.isArray(filter.$exclude)

const splitViewFilters = (
  viewFilters: readonly ViewFilter[],
): { excludeFilters: Record<string, string>[]; includeFilters: Record<string, string>[] } =>
  viewFilters.reduce<{
    excludeFilters: Record<string, string>[]
    includeFilters: Record<string, string>[]
  }>(
    (accumulator, filter) => {
      if (isExcludeViewFilter(filter)) {
        accumulator.excludeFilters.push(filter.$exclude)
        return accumulator
      }

      accumulator.includeFilters.push(filter)
      return accumulator
    },
    { excludeFilters: [], includeFilters: [] },
  )

export const applyViewFilter = async <T extends FilterableNote>(
  notes: readonly T[],
  requestedViewId: string | undefined,
): Promise<T[]> => {
  const { dateFormats, timezone, views: configuredViews } = await resolveNotesConfig()
  const context: ViewFilterContext = { dateFormats, timezone }

  if (!requestedViewId) {
    return [...notes]
  }

  const selectedView = configuredViews.find(({ id }) => id === requestedViewId)

  if (!selectedView) {
    return [...notes]
  }

  const { excludeFilters, includeFilters } = splitViewFilters(selectedView.filters)

  return notes.filter((note) => {
    const matchesIncludeFilter =
      includeFilters.length === 0 ||
      includeFilters.some((group) => matchesViewFilters(note, group, context))

    if (!matchesIncludeFilter) {
      return false
    }

    return excludeFilters.every(
      (group) => !matchesViewFilters(note, group, context),
    )
  })
}

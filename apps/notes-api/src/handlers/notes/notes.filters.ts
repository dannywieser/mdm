import type { NotesView } from "app-config"
import type { Note } from "markdown"

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
  expectedValue: string
): boolean => {
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
  filters: Record<string, string>
): boolean =>
  Object.entries(filters).every(([filterPath, expectedValue]) =>
    isMatchingFilterValue(getValueByPath(note, filterPath), expectedValue)
  )

export const applyViewFilter = (
  notes: readonly Note[],
  configuredViews: readonly NotesView[],
  requestedViewName: string | undefined
): Note[] => {
  if (!requestedViewName) {
    return [...notes]
  }

  const selectedView = configuredViews.find(
    ({ name }) => name === requestedViewName
  )

  if (!selectedView) {
    return [...notes]
  }

  return notes.filter((note) => matchesViewFilters(note, selectedView.filters))
}

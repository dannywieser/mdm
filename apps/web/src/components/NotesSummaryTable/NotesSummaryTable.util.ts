import { getValueByPath } from "mdm-util"
import type { Note } from "markdown"

import type { SortDirection } from "../../hooks/useColumnSort/useColumnSort.types"

export const nameColumnSortKey = "title"

export const resolveBadgeValues = (note: Note, badge: string): string[] => {
  const value = getValueByPath(note, badge)

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value]
  }

  return []
}

export const getColumnLabel = (badge: string): string =>
  badge.split(".").filter(Boolean).at(-1) ?? badge

export const getAriaSort = (
  isActive: boolean,
  direction: SortDirection,
): "ascending" | "descending" | "none" => {
  if (!isActive) return "none"

  return direction === "asc" ? "ascending" : "descending"
}

export const getSortValue = (note: Note, sortKey: string): string =>
  sortKey === nameColumnSortKey ? note.title : resolveBadgeValues(note, sortKey).join(", ")

export const sortNotes = (
  notes: Note[],
  sortKey: string,
  direction: SortDirection,
): Note[] => {
  const directionMultiplier = direction === "asc" ? 1 : -1

  return [...notes].sort(
    (a, b) =>
      directionMultiplier *
      getSortValue(a, sortKey).localeCompare(getSortValue(b, sortKey), undefined, {
        sensitivity: "base",
        numeric: true,
      }),
  )
}

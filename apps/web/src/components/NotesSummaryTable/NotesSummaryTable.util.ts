import { getValueByPath } from "mdm-util"
import type { Note } from "markdown"

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

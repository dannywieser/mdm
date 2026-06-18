import { isNonEmptyString } from "mdm-util"

import type { HabitConfig } from "../types"

const isHabitConfig = (value: unknown): value is HabitConfig => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    (obj.mode === "do-more" || obj.mode === "do-less") &&
    isNonEmptyString(obj.frontmatterProperty) &&
    typeof obj.trackingWindowDays === "number" &&
    Number.isInteger(obj.trackingWindowDays) &&
    obj.trackingWindowDays > 0 &&
    (obj.targetScore === undefined ||
      (typeof obj.targetScore === "number" && obj.targetScore > 0))
  )
}

const HABITS_ERROR =
  "app.config.json habits must be an array of objects with non-empty id, name, frontmatterProperty, mode (\"do-more\" or \"do-less\"), a positive integer trackingWindowDays, and an optional positive targetScore"

export const validateHabits = (value: unknown): HabitConfig[] => {
  if (value === undefined) return []
  if (!Array.isArray(value) || !value.every(isHabitConfig)) {
    throw new Error(HABITS_ERROR)
  }
  return value
}

import { isNonEmptyString, isStringArray, isStringRecord } from "mdm-util"

import type { AppConfigView, ExcludeViewFilter } from "../types"

const isExcludeViewFilter = (value: unknown): value is ExcludeViewFilter => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj)
  return keys.length === 1 && keys[0] === "$exclude" && isStringRecord(obj.$exclude)
}

const isViewFilter = (value: unknown): boolean => {
  if (isExcludeViewFilter(value)) return true
  if (!isStringRecord(value)) return false
  return !("$exclude" in value)
}

const isAppConfigView = (value: unknown): value is AppConfigView => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    isNonEmptyString(obj.id) &&
    isNonEmptyString(obj.name) &&
    isNonEmptyString(obj.component) &&
    (obj.badges === undefined || isStringArray(obj.badges)) &&
    (obj.notesGalleryFilters === undefined || isStringArray(obj.notesGalleryFilters)) &&
    (obj.group === undefined || isNonEmptyString(obj.group)) &&
    Array.isArray(obj.filters) &&
    (obj.filters as unknown[]).every(isViewFilter)
  )
}

const VIEWS_ERROR =
  "app.config.json views must be an array of objects with non-empty id, name, component, optional string arrays badges/notesGalleryFilters, optional string group, and filters as string records or $exclude objects"

export const validateViews = (value: unknown): AppConfigView[] => {
  if (value === undefined) return []
  if (!Array.isArray(value) || !value.every(isAppConfigView)) {
    throw new Error(VIEWS_ERROR)
  }
  return value
}

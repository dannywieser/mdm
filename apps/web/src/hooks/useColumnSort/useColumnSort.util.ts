import type { ColumnSortState, SortDirection } from "./useColumnSort.types"

const isSortDirection = (value: unknown): value is SortDirection =>
  value === "asc" || value === "desc"

export const readStoredSort = (
  storageKey: string,
  defaultSortKey: string,
): ColumnSortState => {
  const fallback: ColumnSortState = { sortKey: defaultSortKey, direction: "asc" }

  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(storageKey)

    if (!raw) return fallback

    const parsed = JSON.parse(raw) as Partial<ColumnSortState>

    if (typeof parsed.sortKey === "string" && isSortDirection(parsed.direction)) {
      return { sortKey: parsed.sortKey, direction: parsed.direction }
    }
  } catch {
    return fallback
  }

  return fallback
}

export const getNextSortState = (
  current: ColumnSortState,
  key: string,
): ColumnSortState => {
  if (current.sortKey !== key) return { sortKey: key, direction: "asc" }

  return { sortKey: key, direction: current.direction === "asc" ? "desc" : "asc" }
}

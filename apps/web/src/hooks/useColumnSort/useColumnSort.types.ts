export type SortDirection = "asc" | "desc"

export interface ColumnSortState {
  sortKey: string
  direction: SortDirection
}

export interface UseColumnSortOptions {
  storageKey: string
  defaultSortKey: string
}

export interface UseColumnSortResult extends ColumnSortState {
  toggleSort: (key: string) => void
}

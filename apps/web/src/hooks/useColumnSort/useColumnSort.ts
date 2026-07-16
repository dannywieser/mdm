import { useCallback, useEffect, useState } from "react"

import type { ColumnSortState, UseColumnSortOptions, UseColumnSortResult } from "./useColumnSort.types"
import { getNextSortState, readStoredSort } from "./useColumnSort.util"

// storageKey is only read once per mount — callers that need a fresh read when
// it changes (e.g. switching views) should remount via a `key` prop.
export const useColumnSort = ({
  storageKey,
  defaultSortKey,
}: UseColumnSortOptions): UseColumnSortResult => {
  const [state, setState] = useState<ColumnSortState>(() =>
    readStoredSort(storageKey, defaultSortKey),
  )

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [storageKey, state])

  const toggleSort = useCallback((key: string) => {
    setState((current) => getNextSortState(current, key))
  }, [])

  return { sortKey: state.sortKey, direction: state.direction, toggleSort }
}

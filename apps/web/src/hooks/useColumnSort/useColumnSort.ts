import { useCallback, useEffect, useState } from "react"

import type { ColumnSortState, UseColumnSortOptions, UseColumnSortResult } from "./useColumnSort.types"
import { getNextSortState, readStoredSort } from "./useColumnSort.util"

export const useColumnSort = ({
  storageKey,
  defaultSortKey,
}: UseColumnSortOptions): UseColumnSortResult => {
  const [loadedStorageKey, setLoadedStorageKey] = useState(storageKey)
  const [state, setState] = useState<ColumnSortState>(() =>
    readStoredSort(storageKey, defaultSortKey),
  )

  if (storageKey !== loadedStorageKey) {
    setLoadedStorageKey(storageKey)
    setState(readStoredSort(storageKey, defaultSortKey))
  }

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state))
  }, [storageKey, state])

  const toggleSort = useCallback((key: string) => {
    setState((current) => getNextSortState(current, key))
  }, [])

  return { sortKey: state.sortKey, direction: state.direction, toggleSort }
}

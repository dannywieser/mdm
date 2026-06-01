import { useQuery } from "@tanstack/react-query"

import { translate } from "../../i18n"
import type { StatsResponse } from "../../types/stats"

import type { UseStatsQueryParams } from "./useStatsQuery.types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api"

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/stats`)

  if (!response.ok) {
    throw new Error(translate("errors.unableToLoadStats"))
  }

  return (await response.json()) as StatsResponse
}

export const useStatsQuery = (_params: UseStatsQueryParams = {}) =>
  useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  })

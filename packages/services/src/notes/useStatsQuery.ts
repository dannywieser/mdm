import { useSuspenseQuery } from "@tanstack/react-query"

import { getBaseUrl } from "../config"

import type { StatsResponse } from "./stats.types"
import type { UseStatsQueryParams } from "./useStatsQuery.types"

const fetchStats = async (): Promise<StatsResponse> => {
  const response = await fetch(`${getBaseUrl()}/stats`)

  if (!response.ok) {
    throw new Error("errors.unableToLoadStats")
  }

  return (await response.json()) as StatsResponse
}

export const useStatsQuery = ({ staleTime }: UseStatsQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime,
  })

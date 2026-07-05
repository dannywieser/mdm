import { useSuspenseQuery } from "@tanstack/react-query"

import type { StatsResponse } from "../../stats.types"
import type { UseStatsQueryParams } from "./useStatsQuery.types"

import { getBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoStatsUrl } from "../../../demo/demoUrls"

const fetchStats = async (): Promise<StatsResponse> => {
  const url = isDemoMode() ? buildDemoStatsUrl() : `${getBaseUrl()}/stats`
  const response = await fetch(url)

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

import { useSuspenseQuery } from "@tanstack/react-query"

import type { StatsHistoryResponse } from "../../stats.types"
import type { UseStatsHistoryParams } from "./useStatsHistory.types"

import { getStatsBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoStatsHistoryUrl } from "../../../demo/demoUrls"

const fetchStatsHistory = async (): Promise<StatsHistoryResponse> => {
  const url = isDemoMode() ? buildDemoStatsHistoryUrl() : `${getStatsBaseUrl()}/history`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("errors.unableToLoadStats")
  }

  return (await response.json()) as StatsHistoryResponse
}

export const useStatsHistory = ({ staleTime }: UseStatsHistoryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["stats", "history"],
    queryFn: fetchStatsHistory,
    staleTime,
  })

import { useSuspenseQuery } from "@tanstack/react-query"

import type { StatsMetaResponse } from "../../stats.types"
import type { UseStatsMetaParams } from "./useStatsMeta.types"

import { getStatsBaseUrl } from "../../../config"
import { isDemoMode } from "../../../demo/demoMode"
import { buildDemoStatsMetaUrl } from "../../../demo/demoUrls"

const fetchStats = async (): Promise<StatsMetaResponse> => {
  const url = isDemoMode() ? buildDemoStatsMetaUrl() : `${getStatsBaseUrl()}/meta`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error("errors.unableToLoadStats")
  }

  return (await response.json()) as StatsMetaResponse
}

export const useStatsMeta = ({ staleTime }: UseStatsMetaParams = {}) =>
  useSuspenseQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime,
  })

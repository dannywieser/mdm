import { useSuspenseQuery } from "@tanstack/react-query"

import type { StatsMetaResponse } from "../../stats.types"
import type { UseStatsQueryParams } from "./useStatsQuery.types"

import { getStatsBaseUrl } from "../../../config"

const fetchStats = async (): Promise<StatsMetaResponse> => {
  const response = await fetch(`${getStatsBaseUrl()}/meta`)

  if (!response.ok) {
    throw new Error("errors.unableToLoadStats")
  }

  return (await response.json()) as StatsMetaResponse
}

export const useStatsQuery = ({ staleTime }: UseStatsQueryParams = {}) =>
  useSuspenseQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime,
  })

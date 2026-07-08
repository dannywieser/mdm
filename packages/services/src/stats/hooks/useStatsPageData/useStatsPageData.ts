import { useSuspenseQueries } from "@tanstack/react-query"

import type { UseStatsPageDataParams } from "./useStatsPageData.types"

import { fetchStatsHistory } from "../useStatsHistory/useStatsHistory"
import { fetchStatsMeta } from "../useStatsMeta/useStatsMeta"

/**
 * Fetches stats meta and history as a single suspense boundary. Calling
 * useStatsMeta and useStatsHistory as two separate useSuspenseQuery hooks in
 * the same component doesn't parallelize them: if the first suspends, React
 * aborts that render before the second hook call is ever reached, so the
 * second query wouldn't start until the first resolves. useSuspenseQueries
 * registers both queries up front, so both requests start together.
 */
export const useStatsPageData = ({ staleTime }: UseStatsPageDataParams = {}) => {
  const [metaQuery, historyQuery] = useSuspenseQueries({
    queries: [
      { queryKey: ["stats"], queryFn: fetchStatsMeta, staleTime },
      { queryKey: ["stats", "history"], queryFn: fetchStatsHistory, staleTime },
    ],
  })

  return { meta: metaQuery.data, history: historyQuery.data }
}

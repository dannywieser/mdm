import type { StatsHistoryResponse } from "./history.types"

export interface StatsHistoryCache {
  get: (compute: () => Promise<StatsHistoryResponse>) => Promise<StatsHistoryResponse>
}

import type { StatsMetaResponse } from "./meta.types"

export interface StatsMetaCache {
  get: (compute: () => Promise<StatsMetaResponse>) => Promise<StatsMetaResponse>
}

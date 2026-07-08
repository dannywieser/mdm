import type { StatsHistoryCache } from "./history.cache.types"
import type { StatsHistoryResponse } from "./history.types"

/**
 * Creates a time-to-live cache for stats-history responses. Concurrent callers
 * during a cache miss share a single in-flight computation rather than each
 * triggering their own vault scan, and a failed computation is not cached so
 * the next call retries.
 */
export const createStatsHistoryCache = (
  ttlMs: number,
  now: () => number = Date.now,
): StatsHistoryCache => {
  let cachedResponse: StatsHistoryResponse | null = null
  let cachedAt = 0
  let pendingComputation: Promise<StatsHistoryResponse> | null = null

  const get = (compute: () => Promise<StatsHistoryResponse>): Promise<StatsHistoryResponse> => {
    if (cachedResponse !== null && now() - cachedAt < ttlMs) {
      return Promise.resolve(cachedResponse)
    }

    pendingComputation ??= compute()
      .then((result) => {
        cachedResponse = result
        cachedAt = now()
        return result
      })
      .finally(() => {
        pendingComputation = null
      })

    return pendingComputation
  }

  return { get }
}

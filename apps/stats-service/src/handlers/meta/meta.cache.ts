import type { StatsMetaCache } from "./meta.cache.types"
import type { StatsMetaResponse } from "./meta.types"

/**
 * Creates a time-to-live cache for stats-meta responses. Concurrent callers
 * during a cache miss share a single in-flight computation rather than each
 * triggering their own vault scan, and a failed computation is not cached so
 * the next call retries.
 */
export const createStatsMetaCache = (
  ttlMs: number,
  now: () => number = Date.now,
): StatsMetaCache => {
  let cachedResponse: StatsMetaResponse | null = null
  let cachedAt = 0
  let pendingComputation: Promise<StatsMetaResponse> | null = null

  const get = (compute: () => Promise<StatsMetaResponse>): Promise<StatsMetaResponse> => {
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

import type { StatsMetaResponse } from "./meta.types"

import { createStatsMetaCache } from "./meta.cache"

const makeResponse = (totalNotes: number): StatsMetaResponse => ({
  totalAttachments: {},
  totalFolders: 0,
  totalNotes,
  totalWords: 0,
})

describe("createStatsMetaCache", () => {
  test("returns the freshly computed value on the first call", async () => {
    const cache = createStatsMetaCache(1000)
    const compute = vi.fn().mockResolvedValue(makeResponse(1))

    await expect(cache.get(compute)).resolves.toEqual(makeResponse(1))
    expect(compute).toHaveBeenCalledTimes(1)
  })

  test("returns the cached value without recomputing while still fresh", async () => {
    let currentTime = 0
    const cache = createStatsMetaCache(1000, () => currentTime)
    const compute = vi.fn().mockResolvedValue(makeResponse(1))

    await cache.get(compute)
    currentTime = 500

    await expect(cache.get(compute)).resolves.toEqual(makeResponse(1))
    expect(compute).toHaveBeenCalledTimes(1)
  })

  test("recomputes once the cached entry has expired", async () => {
    let currentTime = 0
    const cache = createStatsMetaCache(1000, () => currentTime)
    const compute = vi.fn()
      .mockResolvedValueOnce(makeResponse(1))
      .mockResolvedValueOnce(makeResponse(2))

    await cache.get(compute)
    currentTime = 1500

    await expect(cache.get(compute)).resolves.toEqual(makeResponse(2))
    expect(compute).toHaveBeenCalledTimes(2)
  })

  test("shares a single in-flight computation across concurrent callers", async () => {
    const cache = createStatsMetaCache(1000)
    let resolveCompute: (value: StatsMetaResponse) => void = () => { /* assigned below */ }
    const compute = vi.fn().mockImplementation(
      () => new Promise<StatsMetaResponse>((resolve) => { resolveCompute = resolve }),
    )

    const first = cache.get(compute)
    const second = cache.get(compute)
    resolveCompute(makeResponse(1))

    await expect(first).resolves.toEqual(makeResponse(1))
    await expect(second).resolves.toEqual(makeResponse(1))
    expect(compute).toHaveBeenCalledTimes(1)
  })

  test("allows a retry after a failed computation instead of caching the failure", async () => {
    const cache = createStatsMetaCache(1000)
    const compute = vi.fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(makeResponse(1))

    await expect(cache.get(compute)).rejects.toThrow("boom")
    await expect(cache.get(compute)).resolves.toEqual(makeResponse(1))
    expect(compute).toHaveBeenCalledTimes(2)
  })
})

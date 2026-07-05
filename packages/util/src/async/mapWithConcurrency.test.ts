import { describe, expect, test } from "vitest"

import { mapWithConcurrency } from "./mapWithConcurrency"

describe("mapWithConcurrency", () => {
  test("returns results in input order", async () => {
    const results = await mapWithConcurrency([3, 1, 2], 2, (value) =>
      Promise.resolve(value * 10),
    )

    expect(results).toEqual([30, 10, 20])
  })

  test("never runs more than the limit concurrently", async () => {
    let inFlight = 0
    let maxInFlight = 0

    await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 4, async () => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 1))
      inFlight -= 1
    })

    expect(maxInFlight).toBeLessThanOrEqual(4)
  })

  test("passes the item index to the mapper", async () => {
    const results = await mapWithConcurrency(["a", "b"], 1, (item, index) =>
      Promise.resolve(`${item}${String(index)}`),
    )

    expect(results).toEqual(["a0", "b1"])
  })

  test("handles an empty list", async () => {
    await expect(mapWithConcurrency([], 5, () => Promise.resolve(1))).resolves.toEqual(
      [],
    )
  })

  test("rejects a limit below one", async () => {
    await expect(mapWithConcurrency([1], 0, () => Promise.resolve(1))).rejects.toThrow(
      "limit must be at least 1",
    )
  })

  test("propagates mapper failures", async () => {
    await expect(
      mapWithConcurrency([1, 2], 2, (value) =>
        value === 2 ? Promise.reject(new Error("boom")) : Promise.resolve(value),
      ),
    ).rejects.toThrow("boom")
  })
})

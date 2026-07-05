import { mapWithConcurrency } from "./mapWithConcurrency"

describe("mapWithConcurrency", () => {
  test("maps every item and preserves input order in the result", async () => {
    const result = await mapWithConcurrency([3, 1, 2], 2, (item) => Promise.resolve(item * 10))

    expect(result).toEqual([30, 10, 20])
  })

  test("returns an empty array for empty input", async () => {
    const result = await mapWithConcurrency<number, number>([], 5, (item) => Promise.resolve(item))

    expect(result).toEqual([])
  })

  test("never runs more mappers concurrently than the given limit", async () => {
    let active = 0
    let maxActive = 0

    await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (item) => {
      active += 1
      maxActive = Math.max(maxActive, active)
      await new Promise((resolve) => setTimeout(resolve, 5))
      active -= 1
      return item
    })

    expect(maxActive).toBeLessThanOrEqual(2)
  })

  test("caps concurrency at the number of items when the limit is higher", async () => {
    const calls: number[] = []

    await mapWithConcurrency([1, 2], 10, (item) => {
      calls.push(item)
      return Promise.resolve(item)
    })

    expect(calls).toHaveLength(2)
  })

  test("propagates a mapper rejection", async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, (item) =>
        item === 2 ? Promise.reject(new Error("boom")) : Promise.resolve(item),
      ),
    ).rejects.toThrow("boom")
  })
})

import { describe, expect, test } from "vitest"

import { chance, createRandom, pickMany, pickOne, randomInt } from "./random"

describe("createRandom", () => {
  test("produces the same sequence for the same seed", () => {
    const first = createRandom(42)
    const second = createRandom(42)

    expect([first(), first(), first()]).toEqual([second(), second(), second()])
  })

  test("produces different sequences for different seeds", () => {
    const first = createRandom(1)
    const second = createRandom(2)

    expect(first()).not.toBe(second())
  })

  test("returns values in the [0, 1) range", () => {
    const random = createRandom(7)

    for (let index = 0; index < 100; index += 1) {
      const value = random()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe("randomInt", () => {
  test("stays within the inclusive bounds", () => {
    const random = createRandom(3)

    for (let index = 0; index < 100; index += 1) {
      const value = randomInt(random, 2, 5)
      expect(value).toBeGreaterThanOrEqual(2)
      expect(value).toBeLessThanOrEqual(5)
    }
  })
})

describe("pickOne", () => {
  test("returns an element from the list", () => {
    const random = createRandom(11)

    expect(["a", "b", "c"]).toContain(pickOne(random, ["a", "b", "c"]))
  })
})

describe("pickMany", () => {
  test("returns distinct values capped at the list length", () => {
    const random = createRandom(13)

    const picked = pickMany(random, ["a", "b", "c"], 5)

    expect(picked).toHaveLength(3)
    expect(new Set(picked).size).toBe(3)
  })

  test("returns the requested number of values", () => {
    const random = createRandom(17)

    expect(pickMany(random, ["a", "b", "c", "d"], 2)).toHaveLength(2)
  })
})

describe("chance", () => {
  test("always passes for probability 1 and never for probability 0", () => {
    const random = createRandom(19)

    expect(chance(random, 1)).toBe(true)
    expect(chance(random, 0)).toBe(false)
  })
})

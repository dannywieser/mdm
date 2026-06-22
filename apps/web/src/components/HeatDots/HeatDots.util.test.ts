import { describe, expect, test } from "vitest"

import { calculateHeatDotCount, splitDotsIntoRows } from "./HeatDots.util"

describe("splitDotsIntoRows", () => {
  test("returns a single row for counts up to 5", () => {
    expect(splitDotsIntoRows(1)).toEqual([1])
    expect(splitDotsIntoRows(5)).toEqual([5])
  })

  test("splits into two rows when count exceeds 5", () => {
    expect(splitDotsIntoRows(6)).toEqual([5, 1])
    expect(splitDotsIntoRows(10)).toEqual([5, 5])
  })

  test("handles counts that span three or more rows", () => {
    expect(splitDotsIntoRows(11)).toEqual([5, 5, 1])
    expect(splitDotsIntoRows(15)).toEqual([5, 5, 5])
  })
})

describe("calculateHeatDotCount", () => {
  test("returns 0 for do-more habits", () => {
    expect(calculateHeatDotCount("do-more", 100, 50)).toBe(0)
  })

  test("returns 0 when no target score is defined", () => {
    expect(calculateHeatDotCount("do-less", 100, undefined)).toBe(0)
  })

  test("returns 0 when score is at or below the target", () => {
    expect(calculateHeatDotCount("do-less", 50, 50)).toBe(0)
    expect(calculateHeatDotCount("do-less", 40, 50)).toBe(0)
  })

  test("returns one dot per 10 points above the target", () => {
    expect(calculateHeatDotCount("do-less", 60, 50)).toBe(1)
    expect(calculateHeatDotCount("do-less", 80, 50)).toBe(3)
  })

  test("floors the result when the excess is not a clean multiple", () => {
    expect(calculateHeatDotCount("do-less", 69, 50)).toBe(1)
  })
})

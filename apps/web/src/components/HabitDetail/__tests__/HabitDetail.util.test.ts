import { describe, expect, test } from "vitest"

import {
  calculateStreakAxisMax,
  calculateWindowFillPercentage,
  formatChartDate,
  formatEntryValue,
} from "../HabitDetail.util"

describe("formatChartDate", () => {
  test("formats an ISO date string as a short month and day", () => {
    expect(formatChartDate("2026-03-05")).toBe("Mar 5")
  })
})

describe("formatEntryValue", () => {
  test("returns the plain value when no recent multiplier is present", () => {
    expect(formatEntryValue(8, undefined)).toBe("8")
  })

  test("appends the multiplier when one is present", () => {
    expect(formatEntryValue(8, 2)).toBe("8 (x2)")
  })
})

describe("calculateWindowFillPercentage", () => {
  test("rounds window entries as a percentage of the tracking window", () => {
    expect(calculateWindowFillPercentage(5, 7)).toBe(71)
  })
})

describe("calculateStreakAxisMax", () => {
  test("returns undefined when no target score is configured", () => {
    expect(calculateStreakAxisMax(17, undefined)).toBeUndefined()
  })

  test("returns undefined when the streak has never been above zero", () => {
    expect(calculateStreakAxisMax(0, 100)).toBeUndefined()
  })

  test("compresses the axis toward the target using a geometric mean", () => {
    expect(calculateStreakAxisMax(17, 100)).toBeCloseTo(Math.sqrt(1700))
  })

  test("never shrinks the axis below the actual streak peak", () => {
    expect(calculateStreakAxisMax(150, 100)).toBe(150)
  })
})

import { describe, expect, test } from "vitest"

import { calculateRowSpan } from "../useMasonryRowSpan.util"

describe("calculateRowSpan", () => {
  test("returns the number of rows needed to cover the height including gaps", () => {
    expect(calculateRowSpan(100, 8, 16)).toBe(5)
  })

  test("rounds up when the height does not divide evenly", () => {
    expect(calculateRowSpan(90, 8, 16)).toBe(5)
  })

  test("never returns less than one row", () => {
    expect(calculateRowSpan(0, 8, 16)).toBe(1)
  })

  test("returns one row when the row height and gap are non-positive", () => {
    expect(calculateRowSpan(100, 0, 0)).toBe(1)
  })
})

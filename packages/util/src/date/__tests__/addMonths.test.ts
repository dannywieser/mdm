import { addMonths } from "../addMonths"

describe("addMonths", () => {
  test("adds positive months within the same year", () => {
    expect(addMonths("2026-01", 3)).toBe("2026-04")
  })

  test("subtracts negative months within the same year", () => {
    expect(addMonths("2026-07", -3)).toBe("2026-04")
  })

  test("crosses a year boundary going forward", () => {
    expect(addMonths("2025-11", 3)).toBe("2026-02")
  })

  test("crosses a year boundary going backward", () => {
    expect(addMonths("2026-02", -3)).toBe("2025-11")
  })

  test("returns the same month for zero months", () => {
    expect(addMonths("2026-06", 0)).toBe("2026-06")
  })
})

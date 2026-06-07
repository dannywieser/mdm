import { addDays } from "./addDays"

describe("addDays", () => {
  test("adds positive days", () => {
    expect(addDays("2025-01-01", 10)).toBe("2025-01-11")
  })

  test("subtracts negative days", () => {
    expect(addDays("2025-01-11", -10)).toBe("2025-01-01")
  })

  test("crosses a month boundary", () => {
    expect(addDays("2025-01-31", 1)).toBe("2025-02-01")
  })

  test("crosses a year boundary", () => {
    expect(addDays("2024-12-31", 1)).toBe("2025-01-01")
  })

  test("returns the same date for zero days", () => {
    expect(addDays("2025-06-15", 0)).toBe("2025-06-15")
  })
})

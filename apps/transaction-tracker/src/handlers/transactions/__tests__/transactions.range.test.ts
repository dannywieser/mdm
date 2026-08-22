import { resolveTransactionRange } from "../transactions.range"

const TODAY = "2026-03-17"

describe("resolveTransactionRange", () => {
  test("expands a month shorthand to the whole calendar month", () => {
    expect(resolveTransactionRange({ month: "2026-02" }, TODAY)).toEqual({
      from: "2026-02-01",
      to: "2026-02-28",
    })
  })

  test("expands a month shorthand for a leap February", () => {
    expect(resolveTransactionRange({ month: "2024-02" }, TODAY)).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    })
  })

  test("resolves a far-future month the same way as a current one", () => {
    expect(resolveTransactionRange({ month: "2099-07" }, TODAY)).toEqual({
      from: "2099-07-01",
      to: "2099-07-31",
    })
  })

  test("defaults to the month containing today", () => {
    expect(resolveTransactionRange({}, TODAY)).toEqual({ from: "2026-03-01", to: "2026-03-31" })
  })

  test("uses an explicit from/to pair", () => {
    expect(resolveTransactionRange({ from: "2026-03-05", to: "2026-03-09" }, TODAY)).toEqual({
      from: "2026-03-05",
      to: "2026-03-09",
    })
  })

  test("accepts a single-day window", () => {
    expect(resolveTransactionRange({ from: "2026-03-05", to: "2026-03-05" }, TODAY)).toEqual({
      from: "2026-03-05",
      to: "2026-03-05",
    })
  })

  test("rejects a malformed month", () => {
    expect(() => resolveTransactionRange({ month: "2026-3" }, TODAY)).toThrow(/YYYY-MM/)
  })

  test("rejects a from with no to", () => {
    expect(() => resolveTransactionRange({ from: "2026-03-01" }, TODAY)).toThrow(/YYYY-MM-DD/)
  })

  test("rejects a malformed date", () => {
    expect(() => resolveTransactionRange({ from: "not-a-date", to: "2026-03-09" }, TODAY)).toThrow(
      /YYYY-MM-DD/,
    )
  })

  test("rejects a to that precedes from", () => {
    expect(() => resolveTransactionRange({ from: "2026-03-09", to: "2026-03-05" }, TODAY)).toThrow(
      /must not be earlier/,
    )
  })
})

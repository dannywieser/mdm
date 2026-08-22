import { DEFAULT_TRANSACTIONS_CONFIG, resolveTransactions } from "../transactions"

describe("resolveTransactions", () => {
  test("returns the defaults when the block is absent", () => {
    expect(resolveTransactions(undefined)).toEqual(DEFAULT_TRANSACTIONS_CONFIG)
  })

  test("returns a copy rather than the shared defaults object", () => {
    expect(resolveTransactions(undefined)).not.toBe(DEFAULT_TRANSACTIONS_CONFIG)
  })

  test("overrides only the properties that are provided", () => {
    expect(resolveTransactions({ amountProperty: "cost", currency: "CAD" })).toEqual({
      ...DEFAULT_TRANSACTIONS_CONFIG,
      amountProperty: "cost",
      currency: "CAD",
    })
  })

  test("accepts an empty folder to scan the whole vault", () => {
    expect(resolveTransactions({ folder: "" }).folder).toBe("")
  })

  test("accepts a folder restricting the scan", () => {
    expect(resolveTransactions({ folder: "finance" }).folder).toBe("finance")
  })

  test("rejects a non-object block", () => {
    expect(() => resolveTransactions("nope")).toThrow(/transactions must be an object/)
  })

  test("rejects an array block", () => {
    expect(() => resolveTransactions([])).toThrow(/transactions must be an object/)
  })

  test("rejects an empty string property name", () => {
    expect(() => resolveTransactions({ amountProperty: "" })).toThrow(/transactions must be an object/)
  })

  test("rejects a non-string folder", () => {
    expect(() => resolveTransactions({ folder: 3 })).toThrow(/transactions must be an object/)
  })
})

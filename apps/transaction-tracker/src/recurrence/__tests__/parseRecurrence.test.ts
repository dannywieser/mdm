import { parseRecurrence } from "../parseRecurrence"

describe("parseRecurrence", () => {
  test.each([
    ["daily", { interval: 1, unit: "day" }],
    ["weekly", { interval: 1, unit: "week" }],
    ["biweekly", { interval: 2, unit: "week" }],
    ["fortnightly", { interval: 2, unit: "week" }],
    ["monthly", { interval: 1, unit: "month" }],
    ["quarterly", { interval: 3, unit: "month" }],
    ["semiannually", { interval: 6, unit: "month" }],
    ["yearly", { interval: 1, unit: "year" }],
    ["annually", { interval: 1, unit: "year" }],
  ])("parses the named rule %s", (value, expected) => {
    expect(parseRecurrence(value)).toEqual(expected)
  })

  test("matches named rules case-insensitively and ignores surrounding space", () => {
    expect(parseRecurrence("  Monthly  ")).toEqual({ interval: 1, unit: "month" })
  })

  test("strips the quotes a yaml value can arrive wrapped in", () => {
    expect(parseRecurrence('"weekly"')).toEqual({ interval: 1, unit: "week" })
  })

  test("parses an every-N-units rule", () => {
    expect(parseRecurrence("every 2 weeks")).toEqual({ interval: 2, unit: "week" })
  })

  test("parses an every-unit rule with no interval as an interval of one", () => {
    expect(parseRecurrence("every month")).toEqual({ interval: 1, unit: "month" })
  })

  test("parses a singular unit in the every form", () => {
    expect(parseRecurrence("every 3 day")).toEqual({ interval: 3, unit: "day" })
  })

  test("returns null for an unrecognised rule", () => {
    expect(parseRecurrence("whenever")).toBeNull()
  })

  test("returns null for an unknown unit", () => {
    expect(parseRecurrence("every 2 fortnights")).toBeNull()
  })

  test("returns null for a zero interval", () => {
    expect(parseRecurrence("every 0 weeks")).toBeNull()
  })

  test("returns null for an empty value", () => {
    expect(parseRecurrence("   ")).toBeNull()
  })

  test("returns null for a non-string value", () => {
    expect(parseRecurrence(7)).toBeNull()
  })
})

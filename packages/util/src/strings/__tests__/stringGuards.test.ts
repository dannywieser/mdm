import { isNonEmptyString } from "../isNonEmptyString"
import { isStringArray } from "../isStringArray"
import { isStringRecord } from "../isStringRecord"

describe("string guards", () => {
  test("isNonEmptyString validates trimmed string content", () => {
    expect(isNonEmptyString(" value ")).toBe(true)
    expect(isNonEmptyString("   ")).toBe(false)
    expect(isNonEmptyString(123)).toBe(false)
  })

  test("isStringArray validates non-empty string arrays", () => {
    expect(isStringArray(["one", "two"])).toBe(true)
    expect(isStringArray(["one", ""])).toBe(false)
    expect(isStringArray("one")).toBe(false)
  })

  test("isStringRecord validates non-empty string records", () => {
    expect(isStringRecord({ topic: "Reading" })).toBe(true)
    expect(isStringRecord({ topic: "" })).toBe(false)
    expect(isStringRecord(["topic"])).toBe(false)
  })
})

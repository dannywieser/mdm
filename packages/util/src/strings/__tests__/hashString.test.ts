import { hashString } from "../hashString"

describe("hashString", () => {
  test("returns the same hash for the same input", () => {
    expect(hashString("notes/trip.md")).toBe(hashString("notes/trip.md"))
  })

  test("returns different hashes for different inputs", () => {
    expect(hashString("note-a")).not.toBe(hashString("note-b"))
  })

  test("is sensitive to character order", () => {
    expect(hashString("ab")).not.toBe(hashString("ba"))
  })

  test("returns a non-negative integer", () => {
    for (const value of ["", "a", "note/with/path.md", "ünïcödé"]) {
      const hash = hashString(value)
      expect(Number.isInteger(hash)).toBe(true)
      expect(hash).toBeGreaterThanOrEqual(0)
    }
  })

  test("returns the FNV-1a offset basis for an empty string", () => {
    expect(hashString("")).toBe(2166136261)
  })
})

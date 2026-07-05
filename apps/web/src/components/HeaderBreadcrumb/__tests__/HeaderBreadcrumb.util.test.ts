import { describe, expect, test } from "vitest"

import { resolveCurrentPageLabel } from "../HeaderBreadcrumb.util"

describe("resolveCurrentPageLabel", () => {
  test("returns undefined when no segments match", () => {
    expect(resolveCurrentPageLabel([
      { match: false, label: "stats" },
      { match: false, label: "colors" },
    ])).toBeUndefined()
  })

  test("returns undefined when segments array is empty", () => {
    expect(resolveCurrentPageLabel([])).toBeUndefined()
  })

  test("returns the label of the first matching segment", () => {
    expect(resolveCurrentPageLabel([
      { match: false, label: "stats" },
      { match: true, label: "colors" },
      { match: true, label: "daily" },
    ])).toBe("colors")
  })

  test("skips matching segments with undefined label", () => {
    expect(resolveCurrentPageLabel([
      { match: true, label: undefined },
      { match: true, label: "daily" },
    ])).toBe("daily")
  })

  test("returns undefined when only match has undefined label", () => {
    expect(resolveCurrentPageLabel([
      { match: true, label: undefined },
      { match: false, label: "colors" },
    ])).toBeUndefined()
  })
})

import { describe, expect, test } from "vitest"

import {
  buildFrontmatterParamKey,
  parseParamValues,
  serializeParamValues,
  toggleParamValue,
  toggleSearchParams,
} from "../NotesFilterFacetGroup.util"

describe("buildFrontmatterParamKey", () => {
  test("prefixes the frontmatter key with fm.", () => {
    expect(buildFrontmatterParamKey("status")).toBe("fm.status")
  })
})

describe("parseParamValues", () => {
  test("returns an empty array when the param is missing", () => {
    expect(parseParamValues(new URLSearchParams(""), "year")).toEqual([])
  })

  test("splits a comma-separated param", () => {
    expect(parseParamValues(new URLSearchParams("year=2023,2024"), "year")).toEqual(["2023", "2024"])
  })

  test("drops empty segments", () => {
    expect(parseParamValues(new URLSearchParams("year=2023,,2024"), "year")).toEqual(["2023", "2024"])
  })
})

describe("toggleParamValue", () => {
  test("adds a value that is not already present", () => {
    expect(toggleParamValue(["2023"], "2024")).toEqual(["2023", "2024"])
  })

  test("removes a value that is already present", () => {
    expect(toggleParamValue(["2023", "2024"], "2023")).toEqual(["2024"])
  })
})

describe("serializeParamValues", () => {
  test("joins values with a comma", () => {
    expect(serializeParamValues(["2023", "2024"])).toBe("2023,2024")
  })

  test("returns an empty string for no values", () => {
    expect(serializeParamValues([])).toBe("")
  })
})

describe("toggleSearchParams", () => {
  test("adds a value to an unset param", () => {
    const result = toggleSearchParams(new URLSearchParams(""), "year", "2024")

    expect(result.get("year")).toBe("2024")
  })

  test("adds a value alongside existing selections for the same param", () => {
    const result = toggleSearchParams(new URLSearchParams("year=2023"), "year", "2024")

    expect(result.get("year")).toBe("2023,2024")
  })

  test("removes a value that is already selected", () => {
    const result = toggleSearchParams(new URLSearchParams("year=2023,2024"), "year", "2023")

    expect(result.get("year")).toBe("2024")
  })

  test("deletes the param entirely when removing the last selected value", () => {
    const result = toggleSearchParams(new URLSearchParams("year=2024"), "year", "2024")

    expect(result.has("year")).toBe(false)
  })

  test("leaves other params untouched", () => {
    const result = toggleSearchParams(new URLSearchParams("q=game&year=2024"), "year", "2023")

    expect(result.get("q")).toBe("game")
  })
})

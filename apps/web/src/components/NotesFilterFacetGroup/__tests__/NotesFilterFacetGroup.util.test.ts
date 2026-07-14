import { describe, expect, test } from "vitest"

import {
  buildFrontmatterParamKey,
  getFrontmatterKeysFromParams,
  parseParamValues,
  toggleParamValue,
  toggleSearchParams,
} from "../NotesFilterFacetGroup.util"

describe("buildFrontmatterParamKey", () => {
  test("prefixes the frontmatter key with fm.", () => {
    expect(buildFrontmatterParamKey("status")).toBe("fm.status")
  })
})

describe("getFrontmatterKeysFromParams", () => {
  test("returns an empty array when there are no fm. params", () => {
    expect(getFrontmatterKeysFromParams(new URLSearchParams("q=game&year=2024"))).toEqual([])
  })

  test("strips the fm. prefix from each matching param", () => {
    expect(
      getFrontmatterKeysFromParams(new URLSearchParams("fm.status=done&fm.genre=fiction")),
    ).toEqual(["status", "genre"])
  })

  test("de-duplicates keys", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("fm.status", "done")
    searchParams.append("fm.status", "active")

    expect(getFrontmatterKeysFromParams(searchParams)).toEqual(["status"])
  })
})

describe("parseParamValues", () => {
  test("returns an empty array when the param is missing", () => {
    expect(parseParamValues(new URLSearchParams(""), "year")).toEqual([])
  })

  test("reads every occurrence of a repeated param", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("year", "2023")
    searchParams.append("year", "2024")

    expect(parseParamValues(searchParams, "year")).toEqual(["2023", "2024"])
  })

  test("preserves a value that itself contains a comma", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("fm.genre", "sci-fi, fantasy")

    expect(parseParamValues(searchParams, "fm.genre")).toEqual(["sci-fi, fantasy"])
  })

  test("trims incidental whitespace around a value", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("year", "  2024  ")

    expect(parseParamValues(searchParams, "year")).toEqual(["2024"])
  })

  test("drops occurrences that are only whitespace", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("year", "2023")
    searchParams.append("year", "   ")
    searchParams.append("year", "2024")

    expect(parseParamValues(searchParams, "year")).toEqual(["2023", "2024"])
  })

  test("de-duplicates repeated occurrences", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("year", "2023")
    searchParams.append("year", "2024")
    searchParams.append("year", "2023")

    expect(parseParamValues(searchParams, "year")).toEqual(["2023", "2024"])
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

describe("toggleSearchParams", () => {
  test("adds a value to an unset param", () => {
    const result = toggleSearchParams(new URLSearchParams(""), "year", "2024")

    expect(result.getAll("year")).toEqual(["2024"])
  })

  test("adds a value alongside existing selections for the same param", () => {
    const result = toggleSearchParams(new URLSearchParams("year=2023"), "year", "2024")

    expect(result.getAll("year")).toEqual(["2023", "2024"])
  })

  test("removes a value that is already selected", () => {
    const searchParams = new URLSearchParams()
    searchParams.append("year", "2023")
    searchParams.append("year", "2024")

    const result = toggleSearchParams(searchParams, "year", "2023")

    expect(result.getAll("year")).toEqual(["2024"])
  })

  test("deletes the param entirely when removing the last selected value", () => {
    const result = toggleSearchParams(new URLSearchParams("year=2024"), "year", "2024")

    expect(result.has("year")).toBe(false)
  })

  test("leaves other params untouched", () => {
    const result = toggleSearchParams(new URLSearchParams("q=game&year=2024"), "year", "2023")

    expect(result.get("q")).toBe("game")
  })

  test("preserves a value that itself contains a comma", () => {
    const result = toggleSearchParams(new URLSearchParams(""), "fm.genre", "sci-fi, fantasy")

    expect(result.getAll("fm.genre")).toEqual(["sci-fi, fantasy"])
  })
})

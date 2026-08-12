import { describe, expect, test } from "vitest"

import { extractTags } from "../extractTags"

describe("extractTags", () => {
  test("returns an empty array when there are no tags", () => {
    expect(extractTags("Just some text, no hashtags here.")).toEqual([])
  })

  test("extracts a simple tag", () => {
    expect(extractTags("Went for a run today #fitness")).toEqual(["fitness"])
  })

  test("expands a nested tag into its segments plus the full tag", () => {
    expect(extractTags("Journal entry #personal/daily")).toEqual(["personal", "daily", "personal/daily"])
  })

  test("expands a deeply nested tag into every segment plus the full tag", () => {
    expect(extractTags("#work/project/mdm")).toEqual(["work", "project", "mdm", "work/project/mdm"])
  })

  test("deduplicates a segment shared across different nested tags", () => {
    expect(extractTags("#personal/daily and #personal/weekly")).toEqual([
      "personal",
      "daily",
      "personal/daily",
      "weekly",
      "personal/weekly",
    ])
  })

  test("extracts a Bear-style multi-word closed tag", () => {
    expect(extractTags("Reading #book club#  this week")).toEqual(["book club"])
  })

  test("does not treat an ATX heading as a tag", () => {
    expect(extractTags("# Heading\n\n## Subheading\n\ntext")).toEqual([])
  })

  test("does not treat a hash mid-word as a tag", () => {
    expect(extractTags("Writing some C# code")).toEqual([])
  })

  test("extracts multiple distinct simple tags", () => {
    expect(extractTags("#todo #urgent please review")).toEqual(["todo", "urgent"])
  })

  test("deduplicates repeated tags, keeping the first occurrence", () => {
    expect(extractTags("#fitness today, more #fitness tomorrow")).toEqual(["fitness"])
  })

  test("returns tags in document order", () => {
    expect(extractTags("#b then #a then #c")).toEqual(["b", "a", "c"])
  })

  test("extracts a tag at the start of the text", () => {
    expect(extractTags("#standalone")).toEqual(["standalone"])
  })

  test("stops a simple tag at punctuation", () => {
    expect(extractTags("Done with #chores, finally.")).toEqual(["chores"])
  })

  test("returns an empty array for an empty string", () => {
    expect(extractTags("")).toEqual([])
  })
})

import { resolveDateFromFrontmatterOrTitle } from "./resolveDateFromFrontmatterOrTitle"

describe("resolveDateFromFrontmatterOrTitle", () => {
  test("returns frontmatter value parsed by configured format", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "2025.06.15" }, "", "created", false, ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2025, 5, 15)))
  })

  test("falls back to ISO parse when no format matches frontmatter value", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "2025-06-15T10:00:00Z" }, "", "created", false, []),
    ).toEqual(new Date("2025-06-15T10:00:00Z"))
  })

  test("respects a custom frontmatterDateProperty", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(
        { date_created: "2025-06-15T00:00:00Z" },
        "",
        "date_created",
        false,
        [],
      ),
    ).toEqual(new Date("2025-06-15T00:00:00Z"))
  })

  test("returns null when frontmatter is null", () => {
    expect(resolveDateFromFrontmatterOrTitle(null, "", "created", false, [])).toBeNull()
  })

  test("returns null when frontmatter has no matching property", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ type: "book" }, "", "created", false, []),
    ).toBeNull()
  })

  test("returns null when frontmatter value is not parseable", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "not-a-date" }, "", "created", false, []),
    ).toBeNull()
  })

  test("returns null when frontmatter value is an array", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: ["2026-01-15"] }, "", "created", false, []),
    ).toBeNull()
  })

  test("derives date from title when deriveTitleDate is true", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(null, "2026.06.05 My Note", "created", true, ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2026, 5, 5)))
  })

  test("does not use title date when deriveTitleDate is false", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(null, "2026.06.05 My Note", "created", false, ["YYYY.MM.DD"]),
    ).toBeNull()
  })

  test("returns null when deriveTitleDate is true but title has no parseable date", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(null, "My Note", "created", true, ["YYYY.MM.DD"]),
    ).toBeNull()
  })
})

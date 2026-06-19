import { resolveDateFromFrontmatterOrTitle } from "./resolveDateFromFrontmatterOrTitle"

describe("resolveDateFromFrontmatterOrTitle", () => {
  test("returns frontmatter value parsed by configured format", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "2025.06.15" }, "", "created", ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2025, 5, 15)))
  })

  test("falls back to ISO parse when no format matches frontmatter value", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "2025-06-15T10:00:00Z" }, "", "created", []),
    ).toEqual(new Date("2025-06-15T10:00:00Z"))
  })

  test("respects a custom frontmatterDateProperty", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(
        { date_created: "2025-06-15T00:00:00Z" },
        "",
        "date_created",
        [],
      ),
    ).toEqual(new Date("2025-06-15T00:00:00Z"))
  })

  test("returns null when frontmatter is null", () => {
    expect(resolveDateFromFrontmatterOrTitle(null, "", "created", [])).toBeNull()
  })

  test("returns null when frontmatter has no matching property", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ type: "book" }, "", "created", []),
    ).toBeNull()
  })

  test("returns null when frontmatter value is not parseable", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: "not-a-date" }, "", "created", []),
    ).toBeNull()
  })

  test("returns null when frontmatter value is an array", () => {
    expect(
      resolveDateFromFrontmatterOrTitle({ created: ["2026-01-15"] }, "", "created", []),
    ).toBeNull()
  })

  test("derives date from title when frontmatter has no date", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(null, "2026.06.05 My Note", "created", ["YYYY.MM.DD"]),
    ).toEqual(new Date(Date.UTC(2026, 5, 5)))
  })

  test("returns null when title has no parseable date", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(null, "My Note", "created", ["YYYY.MM.DD"]),
    ).toBeNull()
  })

  test("prefers frontmatter date over title date", () => {
    expect(
      resolveDateFromFrontmatterOrTitle(
        { created: "2025.01.01" },
        "2026.06.05 My Note",
        "created",
        ["YYYY.MM.DD"],
      ),
    ).toEqual(new Date(Date.UTC(2025, 0, 1)))
  })
})

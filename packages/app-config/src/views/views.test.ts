import { validateViews } from "./views"

const VALID_VIEW = {
  component: "NotesList",
  filters: [{ folder: "downtime" }],
  id: "books",
  name: "Books",
}

const ERROR =
  "app.config.json views must be an array of objects with non-empty id, name, component, optional string badges/group, and filters as string records or $exclude objects"

describe("validateViews", () => {
  test("returns empty array when value is undefined", () => {
    expect(validateViews(undefined)).toEqual([])
  })

  test("returns validated views for a valid array", () => {
    expect(validateViews([VALID_VIEW])).toEqual([VALID_VIEW])
  })

  test("accepts optional badges array", () => {
    const view = { ...VALID_VIEW, badges: ["folder", "frontmatter.type"] }
    expect(validateViews([view])).toEqual([view])
  })

  test("accepts optional group string", () => {
    const view = { ...VALID_VIEW, group: "library" }
    expect(validateViews([view])).toEqual([view])
  })

  test("accepts $exclude filter", () => {
    const view = { ...VALID_VIEW, filters: [{ $exclude: { folder: "archive" } }] }
    expect(validateViews([view])).toEqual([view])
  })

  test("accepts mixed string record and $exclude filters", () => {
    const view = {
      ...VALID_VIEW,
      filters: [{ folder: "downtime" }, { $exclude: { folder: "archive" } }],
    }
    expect(validateViews([view])).toEqual([view])
  })

  test("throws when value is not an array", () => {
    expect(() => validateViews("not-an-array")).toThrow(ERROR)
  })

  test("throws when view is missing id", () => {
    expect(() => validateViews([{ component: "NotesList", filters: [{ folder: "downtime" }], name: "Books" }])).toThrow(ERROR)
  })

  test("throws when view is missing name", () => {
    expect(() => validateViews([{ component: "NotesList", filters: [{ folder: "downtime" }], id: "books" }])).toThrow(ERROR)
  })

  test("throws when view is missing component", () => {
    expect(() => validateViews([{ filters: [{ folder: "downtime" }], id: "books", name: "Books" }])).toThrow(ERROR)
  })

  test("throws when filters is not an array", () => {
    expect(() => validateViews([{ ...VALID_VIEW, filters: { folder: "downtime" } }])).toThrow(ERROR)
  })

  test("throws when filter is a string instead of an object", () => {
    expect(() => validateViews([{ ...VALID_VIEW, filters: ["folder"] }])).toThrow(ERROR)
  })

  test("throws when $exclude value is not a string record", () => {
    expect(() => validateViews([{ ...VALID_VIEW, filters: [{ $exclude: "archive" }] }])).toThrow(ERROR)
  })

  test("throws when filter object contains a non-string value", () => {
    expect(() => validateViews([{ ...VALID_VIEW, filters: [{ folder: 42 }] }])).toThrow(ERROR)
  })

  test("throws when badges contains an empty string", () => {
    expect(() => validateViews([{ ...VALID_VIEW, badges: ["folder", ""] }])).toThrow(ERROR)
  })

  test("throws when group is an empty string", () => {
    expect(() => validateViews([{ ...VALID_VIEW, group: "" }])).toThrow(ERROR)
  })
})

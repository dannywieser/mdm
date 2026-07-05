import { countDistinctFolders, resolveNoteFolder, sumWordCounts } from "../meta.util"

describe("resolveNoteFolder", () => {
  test("returns the note's folder relative to the notes directory", () => {
    expect(resolveNoteFolder("/notes", "/notes/projects/a.md")).toBe("projects")
  })

  test("returns an empty string for notes at the root of the notes directory", () => {
    expect(resolveNoteFolder("/notes", "/notes/a.md")).toBe("")
  })

  test("returns a forward-slash-joined path for nested folders", () => {
    expect(resolveNoteFolder("/notes", "/notes/projects/2026/a.md")).toBe("projects/2026")
  })
})

describe("countDistinctFolders", () => {
  test("counts unique folders", () => {
    expect(countDistinctFolders(["projects", "archive", "projects"])).toBe(2)
  })

  test("returns 0 for an empty list", () => {
    expect(countDistinctFolders([])).toBe(0)
  })
})

describe("sumWordCounts", () => {
  test("sums word counts across bodies", () => {
    expect(sumWordCounts(["the quick brown fox", "hello world"])).toBe(6)
  })

  test("returns 0 for an empty list", () => {
    expect(sumWordCounts([])).toBe(0)
  })

  test("ignores empty bodies", () => {
    expect(sumWordCounts(["", "one two"])).toBe(2)
  })
})

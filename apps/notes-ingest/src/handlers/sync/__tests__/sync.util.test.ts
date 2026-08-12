import type { ScannedNote } from "markdown"

import { validateSyncPayload } from "../sync.util"

const createScannedNote = (overrides: Partial<ScannedNote> = {}): ScannedNote => ({
  basename: "note.md",
  dates: [],
  createdDate: null,
  folder: "",
  frontmatter: null,
  fullPath: "note",
  fullText: "",
  id: "note",
  modifiedDate: "2026-01-01T00:00:00.000Z",
  obsidianUrl: "bear://x-callback-url/open-note?id=note",
  title: "note",
  ...overrides,
})

describe("validateSyncPayload", () => {
  test("returns the payload when it matches the expected shape", () => {
    const note = createScannedNote()

    expect(validateSyncPayload({ deletedIds: ["old-id"], upserts: [note] })).toEqual({
      deletedIds: ["old-id"],
      upserts: [note],
    })
  })

  test("accepts an empty payload", () => {
    expect(validateSyncPayload({ deletedIds: [], upserts: [] })).toEqual({
      deletedIds: [],
      upserts: [],
    })
  })

  test("throws when the body is not an object", () => {
    expect(() => validateSyncPayload("not-an-object")).toThrow(
      "request body must be a JSON object",
    )
  })

  test("throws when the body is null", () => {
    expect(() => validateSyncPayload(null)).toThrow("request body must be a JSON object")
  })

  test("throws when upserts is missing", () => {
    expect(() => validateSyncPayload({ deletedIds: [] })).toThrow(
      "upserts must be an array of notes with a non-empty id",
    )
  })

  test("throws when an upsert entry has no id", () => {
    expect(() =>
      validateSyncPayload({ deletedIds: [], upserts: [{ title: "no id" }] }),
    ).toThrow("upserts must be an array of notes with a non-empty id")
  })

  test("throws when deletedIds is missing", () => {
    expect(() => validateSyncPayload({ upserts: [] })).toThrow(
      "deletedIds must be an array of non-empty strings",
    )
  })

  test("throws when deletedIds contains a non-string entry", () => {
    expect(() => validateSyncPayload({ deletedIds: [1], upserts: [] })).toThrow(
      "deletedIds must be an array of non-empty strings",
    )
  })
})

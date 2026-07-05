import { describe, expect, test } from "vitest"

import { areReadStatesSettled, buildTocNotes } from "../NotesReview.util"

describe("areReadStatesSettled", () => {
  test("returns false when array is empty", () => {
    expect(areReadStatesSettled([])).toBe(false)
  })

  test("returns false when any entry is pending", () => {
    expect(areReadStatesSettled([{ status: "success" }, { status: "pending" }])).toBe(false)
  })

  test("returns true when all entries are settled", () => {
    expect(areReadStatesSettled([{ status: "success" }, { status: "error" }])).toBe(true)
  })
})

describe("buildTocNotes", () => {
  const notes = [
    { id: "1", title: "Note One", obsidianUrl: "obsidian://note-1" },
    { id: "2", title: "Note Two", obsidianUrl: "obsidian://note-2" },
  ]

  test("marks note as read when read state data is true", () => {
    const result = buildTocNotes(notes as never, [{ status: "success", data: true }, { status: "success", data: false }])
    expect(result[0].isRead).toBe(true)
    expect(result[1].isRead).toBe(false)
  })

  test("marks note as unread when read state data is undefined", () => {
    const result = buildTocNotes(notes as never, [{ status: "pending" }])
    expect(result[0].isRead).toBe(false)
  })

  test("maps id, title, and obsidianUrl from the note", () => {
    const result = buildTocNotes(notes as never, [{ status: "success", data: false }, { status: "success", data: false }])
    expect(result[0]).toMatchObject({ id: "1", title: "Note One", obsidianUrl: "obsidian://note-1" })
  })
})

import type { Note } from "markdown"
import { describe, expect, test } from "vitest"

import {
  PREVIEW_NOTE_LIMIT,
  selectPreviewNotes,
} from "../HomeViewPreviewCard.util"

const buildNote = (
  id: string,
  createdDate: string | undefined,
  images: string[],
): Note =>
  ({
    id,
    title: id,
    createdDate,
    modifiedDate: "2024-01-01T00:00:00.000Z",
    frontmatter: { images },
  }) as unknown as Note

describe("selectPreviewNotes", () => {
  test("drops notes without images", () => {
    const notes = [
      buildNote("with", "2024-05-01T00:00:00.000Z", ["a.jpg"]),
      buildNote("without", "2024-06-01T00:00:00.000Z", []),
    ]

    expect(selectPreviewNotes(notes).map(({ id }) => id)).toEqual(["with"])
  })

  test("orders notes by created date, newest first", () => {
    const notes = [
      buildNote("older", "2024-01-01T00:00:00.000Z", ["a.jpg"]),
      buildNote("newer", "2024-09-01T00:00:00.000Z", ["b.jpg"]),
    ]

    expect(selectPreviewNotes(notes).map(({ id }) => id)).toEqual([
      "newer",
      "older",
    ])
  })

  test("falls back to the modified date when a note has no created date", () => {
    const notes = [buildNote("no-created", undefined, ["a.jpg"])]

    expect(selectPreviewNotes(notes).map(({ id }) => id)).toEqual(["no-created"])
  })

  test("caps the result at the preview limit", () => {
    const notes = Array.from({ length: PREVIEW_NOTE_LIMIT + 5 }, (_, index) =>
      buildNote(`note-${String(index)}`, "2024-01-01T00:00:00.000Z", ["a.jpg"]),
    )

    expect(selectPreviewNotes(notes)).toHaveLength(PREVIEW_NOTE_LIMIT)
  })

  test("honours an explicit limit", () => {
    const notes = [
      buildNote("a", "2024-03-01T00:00:00.000Z", ["a.jpg"]),
      buildNote("b", "2024-02-01T00:00:00.000Z", ["b.jpg"]),
    ]

    expect(selectPreviewNotes(notes, 1).map(({ id }) => id)).toEqual(["a"])
  })

  test("does not mutate the notes it is given", () => {
    const notes = [
      buildNote("older", "2024-01-01T00:00:00.000Z", ["a.jpg"]),
      buildNote("newer", "2024-09-01T00:00:00.000Z", ["b.jpg"]),
    ]

    selectPreviewNotes(notes)

    expect(notes.map(({ id }) => id)).toEqual(["older", "newer"])
  })
})

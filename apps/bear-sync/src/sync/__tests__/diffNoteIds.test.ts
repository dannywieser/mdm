import { diffNoteIds } from "../diffNoteIds"

describe("diffNoteIds", () => {
  test("treats a note absent from previous state as changed", () => {
    const { changedIds } = diffNoteIds([{ ZMODIFICATIONDATE: 0, ZUNIQUEIDENTIFIER: "a" }], {})

    expect(changedIds).toEqual(["a"])
  })

  test("treats a note with a newer modification date as changed", () => {
    const { changedIds } = diffNoteIds(
      [{ ZMODIFICATIONDATE: 100, ZUNIQUEIDENTIFIER: "a" }],
      { a: "2001-01-01T00:00:00.000Z" },
    )

    expect(changedIds).toEqual(["a"])
  })

  test("does not treat a note with an unchanged modification date as changed", () => {
    const { changedIds } = diffNoteIds(
      [{ ZMODIFICATIONDATE: 0, ZUNIQUEIDENTIFIER: "a" }],
      { a: "2001-01-01T00:00:00.000Z" },
    )

    expect(changedIds).toEqual([])
  })

  test("treats an id present in previous state but absent from live notes as deleted", () => {
    const { deletedIds } = diffNoteIds([], { a: "2001-01-01T00:00:00.000Z" })

    expect(deletedIds).toEqual(["a"])
  })

  test("does not report a still-live id as deleted", () => {
    const { deletedIds } = diffNoteIds(
      [{ ZMODIFICATIONDATE: 0, ZUNIQUEIDENTIFIER: "a" }],
      { a: "2001-01-01T00:00:00.000Z" },
    )

    expect(deletedIds).toEqual([])
  })
})

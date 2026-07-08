import type { HistoryNoteDates } from "../history.types"

import { buildHistoryEntries, resolveCreatedDate } from "../history.util"

describe("resolveCreatedDate", () => {
  test("returns the oldest resolvable date as an ISO string", () => {
    const result = resolveCreatedDate(
      ["2026-05-02T00:00:00.000Z", "2026-05-01T00:00:00.000Z"],
      [],
    )

    expect(result).toBe("2026-05-01T00:00:00.000Z")
  })

  test("returns null when no date can be resolved", () => {
    expect(resolveCreatedDate(["not a date"], [])).toBeNull()
  })
})

describe("buildHistoryEntries", () => {
  const makeNote = (overrides: Partial<HistoryNoteDates> = {}): HistoryNoteDates => ({
    createdDate: "2026-05-01T00:00:00.000Z",
    folder: "projects",
    modifiedDate: "2026-05-01T00:00:00.000Z",
    ...overrides,
  })

  test("counts entries created and modified on the same date", () => {
    const entries = buildHistoryEntries([makeNote(), makeNote({ folder: "archive" })], "UTC")

    expect(entries).toEqual([
      { date: "2026-05-01", entriesCreated: 2, entriesModified: 2, foldersTouched: 2 },
    ])
  })

  test("buckets creation and modification into separate dates when they differ", () => {
    const entries = buildHistoryEntries(
      [makeNote({ createdDate: "2026-05-01T00:00:00.000Z", modifiedDate: "2026-05-03T00:00:00.000Z" })],
      "UTC",
    )

    expect(entries).toEqual([
      { date: "2026-05-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 },
      { date: "2026-05-03", entriesCreated: 0, entriesModified: 1, foldersTouched: 1 },
    ])
  })

  test("only counts a modification when createdDate is null", () => {
    const entries = buildHistoryEntries([makeNote({ createdDate: null })], "UTC")

    expect(entries).toEqual([
      { date: "2026-05-01", entriesCreated: 0, entriesModified: 1, foldersTouched: 1 },
    ])
  })

  test("counts distinct folders touched on a date", () => {
    const entries = buildHistoryEntries(
      [makeNote({ folder: "projects" }), makeNote({ folder: "projects" }), makeNote({ folder: "archive" })],
      "UTC",
    )

    expect(entries).toEqual([
      { date: "2026-05-01", entriesCreated: 3, entriesModified: 3, foldersTouched: 2 },
    ])
  })

  test("sorts entries ascending by date", () => {
    const entries = buildHistoryEntries(
      [
        makeNote({ createdDate: "2026-05-03T00:00:00.000Z", modifiedDate: "2026-05-03T00:00:00.000Z" }),
        makeNote({ createdDate: "2026-05-01T00:00:00.000Z", modifiedDate: "2026-05-01T00:00:00.000Z" }),
      ],
      "UTC",
    )

    expect(entries.map((entry) => entry.date)).toEqual(["2026-05-01", "2026-05-03"])
  })

  test("returns an empty array for no notes", () => {
    expect(buildHistoryEntries([], "UTC")).toEqual([])
  })
})

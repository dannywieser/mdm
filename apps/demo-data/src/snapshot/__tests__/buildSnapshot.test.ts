import { promises as fsMock } from "node:fs"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { buildSnapshot } from "../buildSnapshot"

vi.mock("node:fs", () => ({
  promises: {
    cp: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue("---\ncreated: 2024-01-01\n---\n\nBody.\n"),
    rm: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}))

const RESPONSES: Record<string, unknown> = {
  "https://notes/views": { views: [{ id: "books" }] },
  "https://notes/notes?view=books": { notes: [{ id: "1", content: {} }] },
  "https://notes/notes?view=books&includeContent=false": { notes: [{ id: "1" }] },
  "https://notes/notes?includeContent=false": {
    notes: [{ fullPath: "/vault/library/books/dune.md", id: "note-1" }],
  },
  "https://stats/stats/meta": { totalNotes: 1, totalWords: 10 },
  "https://stats/stats/history": [{ date: "2026-05-01", entriesCreated: 1, entriesModified: 0, foldersTouched: 1 }],
  "https://habits/habits": [{ habitId: "exercise" }],
  "https://habits/habits/exercise": { habitId: "exercise", history: [] },
  // The snapshot window is derived from today's date, which the fake timers
  // below pin so this URL stays stable.
  "https://transactions/transactions?from=2025-03-01&to=2028-03-31": {
    currency: "USD",
    from: "2025-03-01",
    to: "2028-03-31",
    totals: { expense: -10, income: 0, logged: -10, net: -10, scheduled: 0 },
    transactions: [{ id: "note-1:2026-03-04" }],
  },
}

const stubFetch = () => {
  const fetchMock = vi.fn((url: string) => {
    const payload = RESPONSES[url]
    if (payload === undefined) {
      return Promise.resolve({ ok: false, status: 404 })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) })
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

const runBuildSnapshot = () =>
  buildSnapshot({
    attachmentsSourceDirectory: "/vault/attachments",
    habitsBaseUrl: "https://habits",
    notesBaseUrl: "https://notes",
    outputDirectory: "/out",
    statsBaseUrl: "https://stats",
    transactionsBaseUrl: "https://transactions",
  })

beforeEach(() => {
  vi.useFakeTimers().setSystemTime(new Date("2026-03-17T12:00:00Z"))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("buildSnapshot", () => {
  test("writes views, per-view notes (full and slim), stats, habits, and transactions", async () => {
    stubFetch()

    const summary = await runBuildSnapshot()

    expect(summary).toEqual({ habitCount: 1, noteCount: 1, transactionCount: 1, viewCount: 1 })
    const writtenFiles = vi
      .mocked(fsMock.writeFile)
      .mock.calls.map(([filePath]) => filePath)
    expect(writtenFiles).toEqual([
      "/out/views.json",
      "/out/notes.books.json",
      "/out/notes.books.slim.json",
      "/out/stats.meta.json",
      "/out/stats.history.json",
      "/out/habits.json",
      "/out/habit.exercise.json",
      "/out/transactions.json",
      "/out/source/note-1.md",
    ])
  })

  test("captures a transaction window spanning a year back and two years forward", async () => {
    const fetchMock = stubFetch()

    await runBuildSnapshot()

    expect(fetchMock).toHaveBeenCalledWith(
      "https://transactions/transactions?from=2025-03-01&to=2028-03-31",
    )
  })

  test("clears the output directory and copies attachments for covers", async () => {
    stubFetch()

    await runBuildSnapshot()

    expect(fsMock.rm).toHaveBeenCalledWith("/out", { force: true, recursive: true })
    expect(fsMock.cp).toHaveBeenCalledWith(
      "/vault/attachments",
      "/out/images/attachments",
      { recursive: true },
    )
  })

  test("copies each note's raw markdown into the source directory", async () => {
    stubFetch()

    await runBuildSnapshot()

    expect(fsMock.readFile).toHaveBeenCalledWith("/vault/library/books/dune.md", "utf8")
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      "/out/source/note-1.md",
      "---\ncreated: 2024-01-01\n---\n\nBody.\n",
      "utf8",
    )
  })

  test("fails when an endpoint returns an error", async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(runBuildSnapshot()).rejects.toThrow("Request failed with status 500")
  })

  test("rejects view ids that are not filename-safe", async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ views: [{ id: "books/archived" }] }),
    })

    await expect(runBuildSnapshot()).rejects.toThrow(
      'View id "books/archived" cannot be used in a demo snapshot filename',
    )
  })

  test("rejects habit ids that are not filename-safe", async () => {
    stubFetch()
    RESPONSES["https://habits/habits"] = [{ habitId: "screen time" }]

    try {
      await expect(runBuildSnapshot()).rejects.toThrow(
        'Habit id "screen time" cannot be used in a demo snapshot filename',
      )
    } finally {
      RESPONSES["https://habits/habits"] = [{ habitId: "exercise" }]
    }
  })
})

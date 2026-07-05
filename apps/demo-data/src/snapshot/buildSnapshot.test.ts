import { promises as fsMock } from "node:fs"
import { describe, expect, test, vi } from "vitest"

import { buildSnapshot } from "./buildSnapshot"

vi.mock("node:fs", () => ({
  promises: {
    cp: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}))

const RESPONSES: Record<string, unknown> = {
  "https://notes/views": { views: [{ id: "books" }] },
  "https://notes/notes?view=books": { notes: [{ id: "1", content: {} }] },
  "https://notes/notes?view=books&includeContent=false": { notes: [{ id: "1" }] },
  "https://notes/stats": { totalNotes: 1 },
  "https://habits/habits": [{ habitId: "exercise" }],
  "https://habits/habits/exercise": { habitId: "exercise", history: [] },
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
  })

describe("buildSnapshot", () => {
  test("writes views, per-view notes (full and slim), stats, and habits", async () => {
    stubFetch()

    const summary = await runBuildSnapshot()

    expect(summary).toEqual({ habitCount: 1, viewCount: 1 })
    const writtenFiles = vi
      .mocked(fsMock.writeFile)
      .mock.calls.map(([filePath]) => filePath)
    expect(writtenFiles).toEqual([
      "/out/views.json",
      "/out/notes.books.json",
      "/out/notes.books.slim.json",
      "/out/stats.json",
      "/out/habits.json",
      "/out/habit.exercise.json",
    ])
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

  test("fails when an endpoint returns an error", async () => {
    const fetchMock = stubFetch()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(runBuildSnapshot()).rejects.toThrow("Request failed with status 500")
  })
})

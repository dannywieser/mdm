import type { ScannedNote } from "../notes.types"

import { createNotesScanCache } from "../notes.cache"

const makeScannedNotes = (id: string): ScannedNote[] => [
  {
    basename: `${id}.md`,
    dates: [],
    createdDate: null,
    folder: "",
    frontmatter: null,
    fullPath: `/notes/${id}.md`,
    fullText: "",
    id,
    modifiedDate: "2026-05-26T00:00:00.000Z",
    obsidianUrl: `obsidian://open?vault=vault&file=${id}`,
    title: id,
  },
]

describe("createNotesScanCache", () => {
  test("returns the freshly computed value on the first call", async () => {
    const cache = createNotesScanCache(1000)
    const scan = vi.fn().mockResolvedValue(makeScannedNotes("a"))

    await expect(cache.get(scan)).resolves.toEqual(makeScannedNotes("a"))
    expect(scan).toHaveBeenCalledTimes(1)
  })

  test("returns the cached value without rescanning while still fresh", async () => {
    let currentTime = 0
    const cache = createNotesScanCache(1000, () => currentTime)
    const scan = vi.fn().mockResolvedValue(makeScannedNotes("a"))

    await cache.get(scan)
    currentTime = 500

    await expect(cache.get(scan)).resolves.toEqual(makeScannedNotes("a"))
    expect(scan).toHaveBeenCalledTimes(1)
  })

  test("rescans once the cached entry has expired", async () => {
    let currentTime = 0
    const cache = createNotesScanCache(1000, () => currentTime)
    const scan = vi.fn()
      .mockResolvedValueOnce(makeScannedNotes("a"))
      .mockResolvedValueOnce(makeScannedNotes("b"))

    await cache.get(scan)
    currentTime = 1500

    await expect(cache.get(scan)).resolves.toEqual(makeScannedNotes("b"))
    expect(scan).toHaveBeenCalledTimes(2)
  })

  test("shares a single in-flight scan across concurrent callers", async () => {
    const cache = createNotesScanCache(1000)
    let resolveScan: (value: ScannedNote[]) => void = () => { /* assigned below */ }
    const scan = vi.fn().mockImplementation(
      () => new Promise<ScannedNote[]>((resolve) => { resolveScan = resolve }),
    )

    const first = cache.get(scan)
    const second = cache.get(scan)
    resolveScan(makeScannedNotes("a"))

    await expect(first).resolves.toEqual(makeScannedNotes("a"))
    await expect(second).resolves.toEqual(makeScannedNotes("a"))
    expect(scan).toHaveBeenCalledTimes(1)
  })

  test("allows a retry after a failed scan instead of caching the failure", async () => {
    const cache = createNotesScanCache(1000)
    const scan = vi.fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(makeScannedNotes("a"))

    await expect(cache.get(scan)).rejects.toThrow("boom")
    await expect(cache.get(scan)).resolves.toEqual(makeScannedNotes("a"))
    expect(scan).toHaveBeenCalledTimes(2)
  })
})

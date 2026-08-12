import type { BearDatabase } from "../db.types"

import { queryLiveNoteMetadata } from "../queryLiveNoteMetadata"

describe("queryLiveNoteMetadata", () => {
  test("selects id and modification date for non-trashed notes", () => {
    const rows = [{ ZMODIFICATIONDATE: 1, ZUNIQUEIDENTIFIER: "a" }]
    const all = vi.fn().mockReturnValue(rows)
    const prepare = vi.fn().mockReturnValue({ all })
    const db: BearDatabase = { backup: vi.fn(), close: vi.fn(), prepare }

    const result = queryLiveNoteMetadata(db)

    expect(prepare).toHaveBeenCalledWith(
      "SELECT ZUNIQUEIDENTIFIER, ZMODIFICATIONDATE FROM ZSFNOTE WHERE ZTRASHED = 0",
    )
    expect(result).toBe(rows)
  })
})

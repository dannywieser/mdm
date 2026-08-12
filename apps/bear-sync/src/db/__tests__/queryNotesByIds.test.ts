import type { BearDatabase } from "../db.types"

import { queryNotesByIds } from "../queryNotesByIds"

describe("queryNotesByIds", () => {
  test("returns an empty array without querying when ids is empty", () => {
    const prepare = vi.fn()
    const db: BearDatabase = { backup: vi.fn(), close: vi.fn(), prepare }

    const result = queryNotesByIds(db, [])

    expect(result).toEqual([])
    expect(prepare).not.toHaveBeenCalled()
  })

  test("queries with one placeholder per id and passes ids as params", () => {
    const rows = [{ ZCREATIONDATE: 1, ZMODIFICATIONDATE: 2, ZTEXT: "text", ZTITLE: "title", ZUNIQUEIDENTIFIER: "a" }]
    const all = vi.fn().mockReturnValue(rows)
    const prepare = vi.fn().mockReturnValue({ all })
    const db: BearDatabase = { backup: vi.fn(), close: vi.fn(), prepare }

    const result = queryNotesByIds(db, ["a", "b"])

    expect(prepare).toHaveBeenCalledWith(
      "SELECT ZUNIQUEIDENTIFIER, ZTITLE, ZTEXT, ZCREATIONDATE, ZMODIFICATIONDATE FROM ZSFNOTE WHERE ZUNIQUEIDENTIFIER IN (?,?)",
    )
    expect(all).toHaveBeenCalledWith("a", "b")
    expect(result).toBe(rows)
  })
})

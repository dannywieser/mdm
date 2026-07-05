import { describe, expect, test, vi } from "vitest"

import { fetchJson } from "../fetchJson"

describe("fetchJson", () => {
  test("returns the parsed JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ hello: "world" }),
      }),
    )

    await expect(fetchJson("http://localhost/views")).resolves.toEqual({
      hello: "world",
    })
  })

  test("throws with the failing URL on non-2xx responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(fetchJson("http://localhost/notes")).rejects.toThrow(
      "Request failed with status 500: http://localhost/notes",
    )
  })
})

import { describe, expect, test, vi } from "vitest"

import { waitForHealth } from "./waitForHealth"

describe("waitForHealth", () => {
  test("resolves once the health endpoint responds OK", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      waitForHealth("http://localhost/health", { delayMs: 1 }),
    ).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  test("throws after exhausting all attempts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    await expect(
      waitForHealth("http://localhost/health", { attempts: 2, delayMs: 1 }),
    ).rejects.toThrow("Service did not become healthy: http://localhost/health")
  })
})

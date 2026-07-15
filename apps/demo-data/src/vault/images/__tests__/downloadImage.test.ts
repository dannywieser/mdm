import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { downloadImage } from "../downloadImage"

describe("downloadImage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // Each case uses a distinct URL — the module-level dedup cache is keyed by
  // URL and persists across tests within this file.
  test("returns a Buffer of the response body on success", async () => {
    const bytes = new Uint8Array([1, 2, 3]).buffer
    vi.mocked(fetch).mockResolvedValue({
      arrayBuffer: () => Promise.resolve(bytes),
      ok: true,
    } as Response)

    const result = await downloadImage("https://images.pexels.com/photos/1/pexels-photo-1.jpeg")

    expect(result).toEqual(Buffer.from(bytes))
  })

  test("returns null on a non-OK response", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response)

    const result = await downloadImage("https://images.pexels.com/photos/2/pexels-photo-2.jpeg")

    expect(result).toBeNull()
  })

  test("returns null when the fetch itself throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"))

    const result = await downloadImage("https://images.pexels.com/photos/3/pexels-photo-3.jpeg")

    expect(result).toBeNull()
  })

  test("caches repeated requests for the same URL", async () => {
    const bytes = new Uint8Array([9]).buffer
    const fetchMock = vi.mocked(fetch).mockResolvedValue({
      arrayBuffer: () => Promise.resolve(bytes),
      ok: true,
    } as Response)
    const url = "https://images.pexels.com/photos/4/pexels-photo-4.jpeg"

    await downloadImage(url)
    await downloadImage(url)

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

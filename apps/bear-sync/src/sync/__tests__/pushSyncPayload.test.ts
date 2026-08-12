import { pushSyncPayload } from "../pushSyncPayload"

describe("pushSyncPayload", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
  })

  test("posts the payload as json to the sync endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

    await pushSyncPayload("https://notes-ingest:3005", { deletedIds: ["b"], upserts: [] })

    expect(fetch).toHaveBeenCalledWith("https://notes-ingest:3005/notes/sync", {
      body: JSON.stringify({ deletedIds: ["b"], upserts: [] }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
  })

  test("throws with the response body when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response("boom", { status: 500, statusText: "Internal Server Error" }),
    )

    await expect(
      pushSyncPayload("https://notes-ingest:3005", { deletedIds: [], upserts: [] }),
    ).rejects.toThrow("notes-ingest sync failed with status 500: boom")
  })
})

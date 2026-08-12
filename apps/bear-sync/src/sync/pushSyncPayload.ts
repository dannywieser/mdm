import type { NoteSyncPayload } from "markdown"

/** POSTs a sync payload to notes-ingest. Throws if the request fails or the response isn't ok. */
export const pushSyncPayload = async (
  notesIngestUrl: string,
  payload: NoteSyncPayload,
): Promise<void> => {
  const response = await fetch(`${notesIngestUrl}/notes/sync`, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`notes-ingest sync failed with status ${String(response.status)}: ${body}`)
  }
}

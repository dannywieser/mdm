# notes-ingest

Express-based endpoint that accepts note sync payloads pushed from `bear-sync` (or any external note source) and stores them in Redis for `notes-api` to serve when `notesSource: "bear"` is configured.

This service intentionally has **no authentication** — it's meant to run only on a trusted local network, reachable from the machine running `bear-sync`.

## Endpoints

- `GET /health`
  - Purpose: verifies Redis is reachable
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when Redis doesn't respond to a ping
    ```json
    { "status": "error", "error": "connection closed" }
    ```
- `POST /notes/sync`
  - Purpose: upsert and/or delete notes in the shared `notes:bear` Redis hash, keyed by note ID
  - Request body:
    ```json
    {
      "upserts": [ { "id": "note-1", "title": "...", "fullText": "...", "...": "rest of the ScannedNote shape" } ],
      "deletedIds": ["note-2"]
    }
    ```
  - Success response: `200`
    ```json
    { "upserted": 1, "deleted": 1 }
    ```
  - Error responses: `400` when the payload doesn't match the expected shape, `500` on a Redis failure
    ```json
    { "error": "upserts must be an array of notes with a non-empty id" }
    ```
    ```json
    { "error": "Unable to apply note sync payload" }
    ```

## Configuration

- `REDIS_URL` (default `redis://localhost:6379`): Redis connection string. The service fails to start if Redis is unreachable — unlike `image-server`'s optional cache, Redis is this service's only datastore.
- `PORT` (default `3005`): HTTP port the service listens on.

## Notes

- The JSON body parser accepts payloads up to 50MB to comfortably fit a full-vault sync of several thousand notes.
- `notes-api`'s Bear-backed `NoteSource` reads from the same `notes:bear` hash this service writes to (the key is exported as `BEAR_NOTES_HASH_KEY` from `packages/markdown`) — the two services never talk to each other directly, only through that shared Redis contract.

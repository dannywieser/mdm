# stats-service

Express-based API for aggregate vault statistics.

## Endpoints

- `GET /health`
  - Purpose: verifies the vault directory (`NOTES_ROOT`) is readable. Only checked when `notesSource` is `"obsidian"` — in `"bear"` mode there is no vault to check, so this only verifies config resolves.
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when config can't be resolved, or (in `"obsidian"` mode only) the vault directory isn't readable
    ```json
    { "status": "error", "error": "ENOENT: no such file or directory, access '/data/notes'" }
    ```
- `GET /stats/meta`
  - Purpose: return top-level vault totals — note count, distinct folder count, word count (counted from note bodies, excluding frontmatter), and attachment count grouped by file extension
  - The response is cached in memory for 5 minutes; concurrent requests during a cache miss share a single in-flight scan instead of each triggering their own. Note bodies are read with a bounded concurrency (20 at a time) to avoid spiking memory/file-descriptor usage on large vaults.
  - When `notesSource` is `"obsidian"`, notes are scanned from the filesystem vault (`NOTES_ROOT`). When `notesSource` is `"bear"`, notes are instead loaded from the `notes:bear` Redis hash that `notes-ingest` populates from `bear-sync` pushes (see `notes-api`'s `README.md`); `totalAttachments` is always `{}` in this mode since Bear has no local attachments directory to scan.
  - Success response: `200`
    ```json
    {
      "totalNotes": 128,
      "totalFolders": 12,
      "totalWords": 45213,
      "totalAttachments": { "png": 34, "pdf": 2 }
    }
    ```
  - Error response: `500`
    ```json
    { "error": "Unable to load stats" }
    ```
  - Sample curl command:
    ```bash
    curl http://localhost/stats/meta
    ```
- `GET /stats/history`
  - Purpose: return one entry per calendar date (in the configured `timezone`) on which any note was created or modified, with the number of notes created, notes modified, and distinct folders touched that date. A note's "created" date is the oldest date resolvable from its title, body, frontmatter, or file modified time (same resolution `notes-api` uses); its "modified" date is the file's modified time. Entries are sorted ascending by date.
  - The response is cached in memory for 5 minutes with the same shared in-flight scan behavior as `/stats/meta`.
  - Same `notesSource` dispatch as `/stats/meta` above: notes come from the filesystem vault or the `notes:bear` Redis hash depending on config. In `"bear"` mode, a note's "created" date is the one bear-sync already resolved when it wrote the note to Redis (same resolution logic, applied at sync time instead of query time).
  - Success response: `200`
    ```json
    [
      { "date": "2026-05-01", "entriesCreated": 3, "entriesModified": 1, "foldersTouched": 2 },
      { "date": "2026-05-02", "entriesCreated": 0, "entriesModified": 2, "foldersTouched": 1 }
    ]
    ```
  - Error response: `500`
    ```json
    { "error": "Unable to load stats history" }
    ```
  - Sample curl command:
    ```bash
    curl http://localhost/stats/history
    ```

## Configuration

- `notesSource` (optional, `"obsidian"` or `"bear"`, defaults to `"obsidian"`, see `packages/app-config`'s config docs): selects where notes are read from.
  - `"obsidian"`: scans the filesystem vault at `NOTES_ROOT` (required in this mode).
  - `"bear"`: reads notes from Redis instead — the `notes:bear` hash that `notes-ingest` populates from `bear-sync` pushes (see `apps/bear-sync/README.md` and `apps/notes-ingest/README.md`). `NOTES_ROOT`/`attachmentsDirectory` are unused in this mode. `REDIS_URL` (environment variable, default `redis://localhost:6379`) configures the connection; the service fails to start if Redis is unreachable when `notesSource` is `"bear"`.
- `NOTES_ROOT` (environment variable, required when `notesSource` is `"obsidian"`): absolute path to the notes vault, same as `notes-api`.
- `attachmentsDirectory` (optional, `app.config.json`): folder name (relative to `NOTES_ROOT`) scanned to compute `totalAttachments`; omitted or unset means `totalAttachments` is always `{}`.

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
  - This service only aggregates notes scanned from a filesystem vault. When `notesSource` is `"bear"` (see `notes-api`'s `README.md`), there's no vault to scan, so all totals are returned as zero (`totalAttachments: {}`) instead of erroring — stats aren't yet supported against the Bear source.
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
  - Same `notesSource: "bear"` caveat as `/stats/meta` above: with no vault to scan, the response is an empty array rather than an error.
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

- `NOTES_ROOT` (environment variable, required): absolute path to the notes vault, same as `notes-api`.
- `attachmentsDirectory` (optional, `app.config.json`): folder name (relative to `NOTES_ROOT`) scanned to compute `totalAttachments`; omitted or unset means `totalAttachments` is always `{}`.

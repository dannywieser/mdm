# stats-service

Express-based API for aggregate vault statistics.

## Endpoints

- `GET /health`
  - Purpose: basic service health check
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
- `GET /stats/meta`
  - Purpose: return top-level vault totals — note count, distinct folder count, word count (counted from note bodies, excluding frontmatter), and attachment count grouped by file extension
  - The response is cached in memory for 5 minutes; concurrent requests during a cache miss share a single in-flight scan instead of each triggering their own. Note bodies are read with a bounded concurrency (20 at a time) to avoid spiking memory/file-descriptor usage on large vaults.
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

## Configuration

- `NOTES_ROOT` (environment variable, required): absolute path to the notes vault, same as `notes-api`.
- `attachmentsDirectory` (optional, `app.config.json`): folder name (relative to `NOTES_ROOT`) scanned to compute `totalAttachments`; omitted or unset means `totalAttachments` is always `{}`.

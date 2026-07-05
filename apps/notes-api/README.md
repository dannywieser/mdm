# notes-api

Express-based Node service with request logging via `morgan`.

## Endpoints

- `GET /health`
  - Purpose: basic service health check
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
- `GET /notes`
  - Purpose: recursively load `*.md` and `*.markdown` files from the directory resolved by `noteRootDirectory` + `obsidianVault` in `app.config.json`, extract optional frontmatter metadata, collect all dates found in the title, body, and frontmatter (plus the file's modified date) using configured `dateFormats`, parse markdown into a node tree, and return note metadata
  - Optional query: `view=<id>` to apply a configured notes view filter by view ID
  - Success response: `200`
    ```json
    {
      "notesDirectory": "/absolute/path/to/notes/vault-name",
      "obsidianVault": "vault-name",
      "notes": [
        {
          "createdDate": "2026-05-26T00:00:00.000Z",
          "modifiedDate": "2026-05-26T00:00:00.000Z",
          "fullPath": "/absolute/path/to/notes/welcome.md",
          "basename": "welcome.md",
          "dates": ["2026.05.26", "2026-05-26T00:00:00.000Z"],
          "id": "welcome",
          "folder": "notes",
          "obsidianUrl": "obsidian://open?vault=vault-name&file=welcome",
          "frontmatter": {
            "topic": ["AI"],
            "created": "2026.05.26"
          },
          "content": {
            "type": "root",
            "children": [
              {
                "type": "heading",
                "depth": 1,
                "children": [{ "type": "text", "value": "Welcome" }]
              }
            ]
          }
        }
      ]
    }
    ```
  - Notes without frontmatter return `"frontmatter": null`
  - Error responses: `500`
    ```json
    {
      "error": "app.config.json is required. Copy app.config.example.json to app.config.json."
    }
    ```
    ```json
    { "error": "Unable to load notes" }
    ```

## Configuration

Configured via `app.config.json` at the repository root (see root README for the full config shape). Fields used by this service:

- `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
- `noteRootDirectory`: absolute path to your notes root directory.
- `obsidianVault`: vault folder name under `noteRootDirectory`.
- `views` (optional): array of view configs. Each view has:
  - `id`: route key used by `GET /notes?view=<id>`
  - `name`: human-readable label
  - `component`: component name that the web app renders for that view (for example `NotesList` or `NotesReview`)
  - `filters`: array of filter groups. Within each standard group, conditions are ANDed; across standard groups, matches are ORed.
    - Use `{"$exclude": { ... }}` to define exclusion groups; exclusion groups are ANDed against all other filters.
    - Use `$missing` as a filter value to match notes where a property path is absent (for example `{"frontmatter.type": "$missing"}`).
  - `badges` (optional): array of note property paths to render as badges in the UI, such as `folder` or `frontmatter.type`

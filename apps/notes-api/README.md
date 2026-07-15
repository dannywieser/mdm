# notes-api

Express-based Node service with request logging via `pino-http`.

## Endpoints

- `GET /health`
  - Purpose: verifies the vault directory (`NOTES_ROOT`) is readable
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when config can't be resolved or the vault directory isn't readable
    ```json
    { "status": "error", "error": "ENOENT: no such file or directory, access '/data/notes'" }
    ```
- `GET /notes`
  - Purpose: recursively load `*.md` and `*.markdown` files from the vault directory (`NOTES_ROOT` env var), extract optional frontmatter metadata (adding every image found in the raw body as a `frontmatter.images` array), collect all dates found in the title, body, and frontmatter (plus the file's modified date) using configured `dateFormats`, parse markdown into a node tree (resolving Obsidian wikilinks and rewriting local image paths to the image-server), and return note metadata
  - Optional query: `view=<id>` to apply a configured notes view filter by view ID
  - Optional query: `includeContent=false` to skip markdown parsing and return an empty `content` tree — useful for lightweight listing requests that only need frontmatter/metadata
  - No other query params are read by this endpoint. In particular, the web app's `NotesGallery` quick filters (year, and any configured `notesGalleryFilters`) are applied entirely client-side against the already-fetched note list — the `year`/`fm.<key>` query params those filters use live only in the browser URL and are never sent to or interpreted by `GET /notes`.
  - The vault scan (walking the directory and reading each file's frontmatter/dates) is cached in memory for 5 minutes and shared across all requests regardless of `view`/`includeContent`; concurrent requests during a cache miss share a single in-flight scan instead of each triggering their own. View filtering and markdown body parsing still run fresh per request against the cached scan, since both depend on the request's query params.
  - Success response: `200`
    ```json
    {
      "notes": [
        {
          "createdDate": "2026-05-26T00:00:00.000Z",
          "modifiedDate": "2026-05-26T00:00:00.000Z",
          "fullPath": "/absolute/path/to/notes/welcome.md",
          "basename": "welcome.md",
          "dates": ["2026.05.26", "2026-05-26T00:00:00.000Z"],
          "id": "welcome",
          "folder": "notes",
          "title": "Welcome",
          "fullText": "# Welcome\n\nHello world.",
          "obsidianUrl": "obsidian://open?vault=vault-name&file=welcome",
          "frontmatter": {
            "topic": ["AI"],
            "created": "2026.05.26",
            "images": ["notes/welcome/photo.png"]
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
          },
          "linkedNotes": []
        }
      ]
    }
    ```
  - Every note's raw body text is scanned for image references (standard `![alt](path)` markdown and Obsidian `![[path]]` embeds), and every image found is resolved and added to `frontmatter.images` as an array, in the order they appear in the note — this is always derived from the body scan and isn't configurable. Notes without frontmatter and without any images return `"frontmatter": null`; notes with images but no other frontmatter return `"frontmatter": { "images": [...] }`. `linkedNotes` (parsed notes referenced via `[[wikilink]]` syntax in the body) is only present on notes that link to others; unmatched wikilinks are left in the body as plain text
  - Error responses: `500`
    ```json
    {
      "error": "app.config.json is required. Copy app.config.example.json to app.config.json."
    }
    ```
    ```json
    { "error": "Unable to load notes" }
    ```
- `GET /views`
  - Purpose: list every configured view with its resolved note count and the IDs of the notes that currently match it, without the cost of parsing/returning full note content — used by the web app to render a view picker with live counts
  - Success response: `200`
    ```json
    {
      "views": [
        {
          "id": "books",
          "name": "Books",
          "component": "NotesGallery",
          "count": 42,
          "noteIds": ["book-1", "book-2"],
          "badges": ["frontmatter.type"],
          "notesGalleryFilters": ["genre", "status"],
          "group": "Library"
        }
      ]
    }
    ```
  - Error response: `500`
    ```json
    { "error": "Unable to load views" }
    ```

## Configuration

Configured via `app.config.json` at the repository root plus the `NOTES_ROOT` environment variable (see `CONTRIBUTING.md` for the full config shape). Fields used by this service:

- `NOTES_ROOT` (environment variable, required): absolute path to your notes root directory. Resolution fails with `"NOTES_ROOT environment variable is required"` if unset.
- `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
- `obsidianVault`: vault folder name, used to build each note's `obsidianUrl` deep link.
- `attachmentsDirectory` (optional): folder name (relative to `NOTES_ROOT`) where Obsidian stores attachments; used to resolve bare-filename images in note bodies to the `/images?path=...` proxy.
- `createdDateProperty` (optional, defaults to `"created"`): frontmatter key treated as the note's created-date source.
- `timezone` (optional, defaults to `"UTC"`): IANA timezone used to evaluate the `$today`/`$onThisDay` filter values against "now".
- `views` (optional): array of view configs. Each view has:
  - `id`: route key used by `GET /notes?view=<id>`
  - `name`: human-readable label
  - `component`: component name that the web app renders for that view (for example `NotesList` or `NotesReview`)
  - `filters`: array of filter groups. Within each standard group, conditions are ANDed; across standard groups, matches are ORed.
    - Use `{"$exclude": { ... }}` to define exclusion groups; a note is excluded if it fully matches any one exclusion group.
    - Use `$missing` as a filter value to match notes where a property path is absent (for example `{"frontmatter.type": "$missing"}`).
    - Use `$today` or `$onThisDay` as a filter value to match a date property against today's date, or against today's month/day in a past year, respectively (both evaluated in the configured `timezone`).
  - `badges` (optional): array of note property paths to render as badges in the UI, such as `folder` or `frontmatter.type`
  - `notesGalleryFilters` (optional): array of bare frontmatter keys (not full property paths, for example `genre` rather than `frontmatter.genre`) that the web app's `NotesGallery` view offers as quick-filter facets, alongside the built-in year facet. This value is only a UI hint passed through to the web app as-is; this API does not evaluate it or filter notes by it — actual filtering happens client-side, per the `GET /notes` note above. A listed key that no note in the view actually has is silently ignored. If omitted or empty, the gallery only shows search and the year facet.
  - `group` (optional): label used to group views together in the web app's view picker

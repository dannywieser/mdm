# bear-sync

A scheduled Mac-side script — not a server, not part of the Docker stack — that reads notes out of [Bear](https://bear.app)'s local sqlite database and pushes them to `notes-ingest`, so `notes-api` can serve them when `notesSource: "bear"` is configured. This has to run on a Mac because Bear only syncs via iCloud into a local sqlite database; there is no remote API to read it from.

## What it does, each run

1. Backs up Bear's live sqlite database into a temp directory using SQLite's Online Backup API (via `better-sqlite3`'s `Database#backup`, opened read-only against the live file), so it reads a consistent snapshot regardless of concurrent writes from Bear — Bear's database uses the classic rollback-journal format (not WAL), where a raw filesystem copy caught mid-write could capture an internally inconsistent snapshot. The temp directory is removed after every run, success or failure.
2. Queries every non-trashed note's ID and modification date only (cheap) and diffs it against the last-synced state (`SYNC_STATE_PATH`) to find changed and deleted note IDs.
3. Fetches full content for changed notes only, and converts each into the same `ScannedNote` shape `notes-api` gets from scanning an Obsidian vault — reusing `parseFrontMatter`/`extractNoteDates` from `packages/markdown`, since Bear notes that use a literal `---frontmatter---` block at the top of their text parse the same way an Obsidian file's frontmatter does.
4. POSTs `{ upserts, deletedIds }` to `notes-ingest`'s `POST /notes/sync`.
5. On success, persists the new id → modification-date state. A failed run does **not** persist state, so the next run retries the same diff.

Tokenization here is deliberately limited to frontmatter + date extraction — the expensive markdown AST parse and wikilink resolution stay in `notes-api`, computed lazily per-request for whichever notes are actually being viewed, exactly like the Obsidian path. This script never builds a markdown tree.

## Bear → Note field mapping

- `id` / `obsidianUrl`: Bear's `ZUNIQUEIDENTIFIER` is used directly as the note ID (already a stable UUID); `obsidianUrl` is populated with a `bear://x-callback-url/open-note?id=...` deep link instead of an `obsidian://` one — the field name is reused as-is rather than renamed across the ~20 files in `apps/web` that reference it, since consumers just render it as a plain link href.
- `title` / `basename`: Bear's `ZTITLE` column.
- `fullText` / `frontmatter`: Bear's `ZTEXT`, run through `parseFrontMatter`.
- `dates`: dates found in the title/body via `extractNoteDates`, plus both `ZCREATIONDATE` and `ZMODIFICATIONDATE` (converted from Core Data's reference epoch) folded in — unlike the Obsidian path, Bear notes have a real DB-tracked creation date, not just a file mtime.
- `tags`: inline `#foo/bar`/`#multi word tag#` hashtags found in the body via `extractTags` — the same first-class tagging Bear's own UI understands, extracted from plain text since Bear stores no separate tag column.
- `folder`: always empty — Bear has no folder concept (tags aren't a stand-in for one here).
- Attachments/images: **out of scope**. `frontmatter.images` is left as whatever the parsed frontmatter contains (typically unset); embedded image links in Bear note bodies won't resolve through `image-server` yet.

## Configuration (environment variables)

- `NOTES_INGEST_URL` (required): base URL of the `notes-ingest` service, e.g. `http://homelab.local:3005`.
- `BEAR_DB_PATH` (default: Bear's standard macOS location, `~/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`).
- `SYNC_STATE_PATH` (default `~/.mdm-bear-sync/state.json`).
- `BEAR_DATE_FORMATS` (optional, comma-separated, e.g. `YYYY.MM.DD,YY/MM/DD`): date formats used to find dates embedded in note titles/bodies. Defaults to none — DB-tracked creation/modification dates are always included regardless.

## Running it

```bash
npm run sync --workspace=bear-sync
```

## Scheduling with launchd

Run on an interval via a `launchd` user agent — create `~/Library/LaunchAgents/net.dgwlab.bear-sync.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>net.dgwlab.bear-sync</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/mdm/apps/bear-sync/dist/cli.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NOTES_INGEST_URL</key>
    <string>http://homelab.local:3005</string>
  </dict>
  <key>StartInterval</key>
  <integer>900</integer>
  <key>StandardOutPath</key>
  <string>/tmp/bear-sync.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/bear-sync.log</string>
</dict>
</plist>
```

Then load it: `launchctl load ~/Library/LaunchAgents/net.dgwlab.bear-sync.plist`. Build the app first (`npm run build --workspace=bear-sync`) so `dist/cli.js` exists.

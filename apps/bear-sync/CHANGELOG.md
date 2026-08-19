# bear-sync

## 0.3.2

### Patch Changes

- markdown@3.6.0
- mdm-util@3.6.0

## 0.3.1

### Patch Changes

- Updated dependencies [32e2a3d]
  - markdown@3.5.0
  - mdm-util@3.5.0

## 0.3.0

### Minor Changes

- e8c02e3: A note's raw body is now also scanned for plain `[label](url)` links whose destination looks like an image file by extension (Bear's inline-image-preview format, e.g. `[3h6HmH](https://images.example.com/i/3h6HmH.jpg)`), in addition to the existing `![alt](path)` and `![[path]]` syntaxes. Matching images are added to `frontmatter.images` the same as any other image, and in `content` the link is rendered as an inline `image` node (`alt` taken from the link text) instead of a plain `link` node. A `[label](url)` link whose destination isn't recognized as an image is left as a normal `link` node.

  `markdown` exports a new `isImageUrl(url)` helper for this extension-based check, plus `resolveFrontmatterImages`/`resolveLocalImagePath` (moved out of `notes-api` so `bear-sync` can share them).

  Bear-sourced notes now get `frontmatter.images` populated too, previously skipped entirely for the Bear note source — this is what `apps/web`'s `NotesGallery` reads to decide which notes have a cover image, so Bear notes with images can now appear there. Only images referenced by an external URL resolve to something renderable, since Bear notes have no local attachments directory for a bare filename to resolve against.

- f0f70e0: Notes now carry a first-class `tags` field, populated by scanning the note body for inline hashtags (`#foo/bar`, and Bear's closing-hash `#multi word tag#` form) — the same syntax Bear treats as first-class, previously only available in Obsidian via frontmatter. Both note sources (file scan and Bear sync) extract tags this way, so `tags` is available on every note regardless of `notesSource`.

  `tags` is a plain string array, so it works with view filters exactly like any other array-valued property (for example `{"tags": "personal/daily"}` in a view's `filters`) and with `badges`/`notesGalleryFilters` the same as `frontmatter.*` array fields. A nested tag is also expanded into its individual segments alongside the full tag — `#foo/bar` produces `"foo"`, `"bar"`, and `"foo/bar"` in `tags` — so a filter can match a specific leaf or any level of the hierarchy. In rendered note content, each inline hashtag is now replaced with a `{"type": "tag", "value": "..."}` markdown node (holding the full, unsplit tag) instead of being left as plain text, and `apps/web` renders it as a small badge inline with the surrounding text.

  `notes-ingest`'s `POST /notes/sync` payload validation now requires `tags` (a string array) on every synced note.

### Patch Changes

- Updated dependencies [e8c02e3]
- Updated dependencies [f0f70e0]
  - markdown@3.4.0
  - mdm-util@3.4.0

## 0.2.0

### Minor Changes

- e53c2a6: Notes can now come from Bear instead of an Obsidian-style vault, selected via the new `notesSource` (`"obsidian"` | `"bear"`, defaults to `"obsidian"`) field in `app.config.json`.

  Two new apps support the Bear path: `bear-sync`, a scheduled Mac-side script that reads notes out of Bear's local sqlite database and pushes changed/deleted notes to `notes-ingest`; and `notes-ingest`, an unauthenticated Express endpoint (`POST /notes/sync`) that stores pushed notes in Redis. When `notesSource: "bear"`, `notes-api`'s `GET /notes` and `GET /views` read from that Redis-backed source instead of scanning `NOTES_ROOT` — the expensive markdown parse/wikilink-resolution step still runs lazily per-request, same as the Obsidian path, so no new eager tokenization work is introduced either way.

  `markdown` now exports the shared `ScannedNote`/`NoteSyncPayload` types and `BEAR_NOTES_HASH_KEY` constant used by all three services to agree on the Redis contract. `mdm-util`'s `createRedisClient` gained `hSet`/`hGetAll`/`hDel` hash operations to back it.

  Attachments/images are out of scope for the Bear source in this pass — Bear notes sync as text/frontmatter only.

### Patch Changes

- e53c2a6: `bear-sync` now removes the temp directory it copies Bear's database into after every run (success or failure), instead of leaking a fresh copy of the entire Bear database on every sync.
- e53c2a6: `bear-sync` now snapshots Bear's live database using SQLite's Online Backup API (`better-sqlite3`'s `Database#backup`) instead of a raw filesystem copy. Bear's database uses the classic rollback-journal format (not WAL), where writes happen in place in the main file — a raw byte copy caught mid-write could capture an internally inconsistent snapshot, up to and including corruption. The backup API reads a consistent snapshot through SQLite's own locking protocol instead, safe regardless of concurrent writes from Bear, at a small fixed cost (roughly 35ms extra on a ~44MB database).
- Updated dependencies [e53c2a6]
  - markdown@3.3.0
  - mdm-util@3.3.0

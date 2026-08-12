# notes-ingest

## 0.3.0

### Minor Changes

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

- Updated dependencies [e53c2a6]
  - markdown@3.3.0
  - mdm-util@3.3.0

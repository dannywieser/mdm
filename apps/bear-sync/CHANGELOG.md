# bear-sync

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

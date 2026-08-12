---
"bear-sync": patch
---

`bear-sync` now snapshots Bear's live database using SQLite's Online Backup API (`better-sqlite3`'s `Database#backup`) instead of a raw filesystem copy. Bear's database uses the classic rollback-journal format (not WAL), where writes happen in place in the main file — a raw byte copy caught mid-write could capture an internally inconsistent snapshot, up to and including corruption. The backup API reads a consistent snapshot through SQLite's own locking protocol instead, safe regardless of concurrent writes from Bear, at a small fixed cost (roughly 35ms extra on a ~44MB database).

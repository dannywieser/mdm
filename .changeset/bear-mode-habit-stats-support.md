---
"habit-tracker": minor
"markdown": minor
"notes-api": patch
"stats-service": minor
---

`habit-tracker` and `stats-service` now fully support `notesSource: "bear"` instead of returning zeroed-out results: both services connect to Redis (like `notes-api` already did) and read notes from the `notes:bear` hash that `notes-ingest` populates from `bear-sync` pushes, scoring habits and aggregating stats from Bear-sourced notes the same way they do for an Obsidian vault.

`markdown` exports a new `loadScannedNotesFromHash(redisClient)` helper (plus the `ScannedNotesRedisClient` type it accepts) that reads and parses the `notes:bear` hash — the Redis-reading logic previously private to `notes-api`'s Bear note source, now shared by all three services. `notes-api`'s own Bear note source is unchanged in behavior, just refactored to use this shared helper.

`habit-tracker` and `stats-service` now require `REDIS_URL` (default `redis://localhost:6379`) when `notesSource` is `"bear"`, and fail to start if Redis is unreachable in that mode — the same requirement `notes-api` already had.

# mdm-util

## 2.1.5

## 2.1.4

## 2.1.3

## 2.1.2

## 2.1.1

## 2.1.0

### Minor Changes

- 2abe52c: Add `GET /stats/history` to stats-service, returning a per-date breakdown of notes created, notes modified, and distinct folders touched across the vault. Adds a `toISODateString` timezone-aware date formatter to `mdm-util`.

## 2.0.2

### Patch Changes

- b3996b4: All 5 backend services now handle SIGTERM/SIGINT gracefully: they stop accepting new connections, let in-flight requests finish, disconnect Redis where applicable (`flag-manager`, `image-server`), and force-exit after a 10s timeout if something hangs, instead of being hard-killed mid-request. This is implemented via a new shared `startServer` helper in `mdm-util/node` that also consolidates the near-identical `app.listen(...)` + logging boilerplate that was previously duplicated across all 5 `server.ts` files. `mdm-util`'s Redis client wrapper (`mdm-util/redis`) gains a `disconnect` method used during shutdown.
- a9c4d83: `/health` on every backend service now verifies its actual dependencies instead of always returning a static `{status:"ok"}`: `notes-api`, `habit-tracker`, `stats-service`, and `image-server` check that their vault/images directory is readable, and `flag-manager` pings Redis. Any of these return `503` with an error message on failure. `mdm-util`'s shared Redis client wrapper (`mdm-util/redis`) gains a `ping` method to support this. `notes-api` and `stats-service` also now fail fast and exit at startup if their config can't be resolved, instead of logging the error and continuing to serve requests in a broken state (matching `flag-manager`/`image-server`'s existing behavior).

## 2.0.1

## 2.0.0

### Minor Changes

- fb9cd71: Extract vault statistics into a new dedicated `stats-service` app. `GET /stats` has been removed from `notes-api` (a breaking change); the new `stats-service` exposes `GET /stats/meta`, returning total notes, total folders, total words (counted from note bodies, excluding frontmatter), and total attachments grouped by file extension. `mdm-util` gains `countWords` and `countFilesByExtension` (replacing `countFilesRecursive`) to support the new endpoint.
- 498a480: Fix `GET /stats/meta` spiking memory and file-descriptor usage on large vaults (observed causing container restarts with ~4600 notes / 3000 attachments): note bodies are now read with a bounded concurrency (20 at a time via the new `mapWithConcurrency` utility in `mdm-util`) instead of all at once. The response is also cached in memory for 5 minutes, with concurrent requests during a cache miss sharing a single in-flight scan rather than each triggering their own.

## 1.10.0

### Minor Changes

- aad607c: Add `countFilesRecursive` to the util package for counting files in a directory tree.

## 1.9.0

## 1.8.0

## 1.7.0

## 1.6.1

## 1.6.0

### Minor Changes

- be835c4: Add `addDays`, `daysBetween`, `buildDateRange`, and `getDateWindowStart` date utilities for working with "YYYY-MM-DD" date strings.

## 1.5.0

## 1.4.0

## 1.3.0

## 1.2.0

## 1.1.0

### Patch Changes

- e41efd1: Add initial Changesets setup for the monorepo, including root scripts, fixed-release configuration, and contributor docs for changelog entries.

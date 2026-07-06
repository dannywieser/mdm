# mdm-util

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

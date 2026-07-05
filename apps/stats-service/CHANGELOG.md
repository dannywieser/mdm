# stats-service

## 1.0.0

### Major Changes

- fb9cd71: Extract vault statistics into a new dedicated `stats-service` app. `GET /stats` has been removed from `notes-api` (a breaking change); the new `stats-service` exposes `GET /stats/meta`, returning total notes, total folders, total words (counted from note bodies, excluding frontmatter), and total attachments grouped by file extension. `mdm-util` gains `countWords` and `countFilesByExtension` (replacing `countFilesRecursive`) to support the new endpoint.

### Minor Changes

- 498a480: Fix `GET /stats/meta` spiking memory and file-descriptor usage on large vaults (observed causing container restarts with ~4600 notes / 3000 attachments): note bodies are now read with a bounded concurrency (20 at a time via the new `mapWithConcurrency` utility in `mdm-util`) instead of all at once. The response is also cached in memory for 5 minutes, with concurrent requests during a cache miss sharing a single in-flight scan rather than each triggering their own.

### Patch Changes

- Updated dependencies [fb9cd71]
- Updated dependencies [492658e]
- Updated dependencies [498a480]
  - mdm-util@2.0.0
  - markdown@2.0.0
  - app-config@2.0.0

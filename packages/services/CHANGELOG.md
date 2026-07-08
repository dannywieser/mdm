# services

## 2.1.2

### Patch Changes

- app-config@2.1.2
- markdown@2.1.2

## 2.1.1

### Patch Changes

- app-config@2.1.1
- markdown@2.1.1

## 2.1.0

### Minor Changes

- 2abe52c: Add a GitHub-style activity graph to the `/stats` page — one square per day, shaded by how many notes were created and modified that day, sourced from the new `GET /stats/history` endpoint. Adds a `useStatsHistory` hook and `StatsHistoryResponse`/`StatsHistoryEntry` types to `services`.

### Patch Changes

- app-config@2.1.0
- markdown@2.1.0

## 2.0.2

### Patch Changes

- app-config@2.0.2
- markdown@2.0.2

## 2.0.1

### Patch Changes

- app-config@2.0.1
- markdown@2.0.1

## 2.0.0

### Major Changes

- 572b5ff: Update the stats page to use the new `stats-service` meta endpoint. The `services` package gains a `useStatsMeta` hook (replacing the old, notes-api-backed `useStatsQuery`) that fetches `GET /stats/meta` (configurable via `setStatsBaseUrl`/`VITE_STATS_BASE_URL`, defaulting to `/stats`) and exposes `StatsMetaResponse` (`totalNotes`, `totalFolders`, `totalWords`, `totalAttachments`) in place of the old, richer `StatsResponse` shape (a breaking change to `services`). The `/stats` page is simplified to display only this data — total notes, folders, and words, plus an attachment breakdown by file extension — using Chakra UI's Stat component. The notes-created trend chart and folder breakdown, which relied on data no longer returned by the backend, have been removed.

### Minor Changes

- 707d12d: Add a static demo mode and GitHub Pages deployment. `services` gains `configureDemoMode`, which switches the query hooks to pre-built static JSON files, swaps the redis-backed read-flag hooks for per-session browser storage, and maps image URLs to static cover files. `web` bootstraps demo mode via `VITE_DEMO_MODE`, supports sub-path hosting via `VITE_BASE_PATH` (router basename included), and adds a `dev:demo` script. The new `demo-data` app generates a deterministic 1500+ note demo vault (journal with habit data, photos, books, movies, quotes, ideas, projects, recipes, people, plus SVG covers) and snapshots the real `notes-api`/`habit-tracker`/`stats-service` responses into `apps/web/public/demo-data`; `.github/workflows/deploy-pages.yml` regenerates and deploys the demo to GitHub Pages daily and on pushes to `main`. Demo covers vary in decoration motif, palette, and (for photos/recipes) aspect ratio to show off the masonry galleries. In demo mode the "open in Obsidian" button instead opens an in-browser note source page with an explanatory info alert.

### Patch Changes

- Updated dependencies [492658e]
  - markdown@2.0.0
  - app-config@2.0.0

## 1.8.2

### Patch Changes

- Updated dependencies [4d8fc0e]
- Updated dependencies [93a0463]
  - app-config@1.10.0
  - markdown@1.10.0

## 1.8.1

### Patch Changes

- app-config@1.9.0
- markdown@1.9.0

## 1.8.0

### Minor Changes

- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.

### Patch Changes

- Updated dependencies [da76fb7]
  - markdown@1.8.0
  - app-config@1.8.0

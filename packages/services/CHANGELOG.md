# services

## 2.3.3

### Patch Changes

- Updated dependencies [f1b9b9a]
  - app-config@3.2.0
  - markdown@3.2.0

## 2.3.2

### Patch Changes

- app-config@3.1.0
- markdown@3.1.0

## 2.3.1

### Patch Changes

- app-config@3.0.1
- markdown@3.0.1

## 2.3.0

### Minor Changes

- 8e4fb01: Add a filter panel to the notes gallery view with quick filters for year and frontmatter values, move note search into the panel with a new clear button, and show active filters as removable chips above the gallery. Which frontmatter properties are offered as gallery filters is now controlled per-view via a new `notesGalleryFilters` array in `app.config.json`'s `views` config (exposed through `GET /views`); a view with no `notesGalleryFilters` configured only shows search and the year filter.

### Patch Changes

- Updated dependencies [8e4fb01]
  - app-config@3.0.0
  - markdown@3.0.0

## 2.2.1

### Patch Changes

- app-config@2.3.1
- markdown@2.3.1

## 2.2.0

### Minor Changes

- 5b101ab: Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and displays a note's first image as its cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.

  Removed the `aspectRatio` and `layout` view config fields (from `app.config.json`'s `views`, the `GET /views` response, and the web app's view component props). These had become dead weight: `layout` was never read by any component after an earlier refactor to a CSS masonry grid, and `aspectRatio` only ever sized `NoteCoverGrid`'s pre-load loading skeleton — it did not shape the final rendered card, which sizes itself from the loaded image's natural dimensions. `NoteCoverGrid` now always uses a fixed default skeleton aspect ratio.

  Fixed a bug where a note's external image URL (e.g. `https://...`) in `frontmatter.images` would render as a broken image in the gallery — the web app was always routing it through the local image proxy, which rejects non-local paths. External URLs are now rendered directly, bypassing the proxy. Added a shared `isExternalUrl` helper to `mdm-util` for this check, also adopted by `notes-api`.

  Fixed two smaller edge cases in `frontmatter.images` derivation: a fragment-only image destination (`![alt](#section)`) is no longer surfaced as an image, since it isn't a resolvable image source; and a frontmatter image value with extra whitespace (e.g. from YAML like `" https://... "`) is now trimmed before checking whether it's an external URL, so it no longer gets incorrectly routed through the image proxy.

  Narrowed which external URLs the web app will render directly: only http(s) or protocol-relative URLs bypass the local image proxy now. Any other scheme (`javascript:`, `data:`, `obsidian://`, etc.) renders nothing instead of being passed to `<img src>` unchecked. Added a new `isHttpUrl` helper to `mdm-util` for this.

### Patch Changes

- Updated dependencies [5b101ab]
  - app-config@2.3.0
  - markdown@2.3.0

## 2.1.11

### Patch Changes

- app-config@2.2.4
- markdown@2.2.4

## 2.1.10

### Patch Changes

- app-config@2.2.3
- markdown@2.2.3

## 2.1.9

### Patch Changes

- app-config@2.2.2
- markdown@2.2.2

## 2.1.8

### Patch Changes

- app-config@2.2.1
- markdown@2.2.1

## 2.1.7

### Patch Changes

- app-config@2.2.0
- markdown@2.2.0

## 2.1.6

### Patch Changes

- app-config@2.1.6
- markdown@2.1.6

## 2.1.5

### Patch Changes

- app-config@2.1.5
- markdown@2.1.5

## 2.1.4

### Patch Changes

- app-config@2.1.4
- markdown@2.1.4

## 2.1.3

### Patch Changes

- app-config@2.1.3
- markdown@2.1.3

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

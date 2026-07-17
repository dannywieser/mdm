# app-config

## 3.2.0

### Minor Changes

- f1b9b9a: Habit scoring is now configurable per-habit via an optional `scoring` object in `app.config.json` (`recentWindowDays`, `recentMultiplier`, `bonusTierSize`, `baseBonusRate`, `bonusRateIncrement`, `minStreakDays`), defaulting to the previous hardcoded values. Setting a field to `0` disables the bonus/penalty it controls — setting every field to `0` reduces a habit to a plain sum of its entry values with a streak and no score bonuses, and the `scoreBreakdown` tiers are omitted entirely when the day/streak bonus is disabled.

  Habit entries also no longer require a frontmatter value of 10 or less — the upper bound is removed so a habit can track an unbounded quantity like a dollar amount (a value below 1 is still rejected).

### Patch Changes

- mdm-util@3.2.0

## 3.1.0

### Patch Changes

- mdm-util@3.1.0

## 3.0.1

### Patch Changes

- mdm-util@3.0.1

## 3.0.0

### Minor Changes

- 8e4fb01: Add a filter panel to the notes gallery view with quick filters for year and frontmatter values, move note search into the panel with a new clear button, and show active filters as removable chips above the gallery. Which frontmatter properties are offered as gallery filters is now controlled per-view via a new `notesGalleryFilters` array in `app.config.json`'s `views` config (exposed through `GET /views`); a view with no `notesGalleryFilters` configured only shows search and the year filter.

### Patch Changes

- mdm-util@3.0.0

## 2.3.1

### Patch Changes

- mdm-util@2.3.1

## 2.3.0

### Minor Changes

- 5b101ab: Notes' frontmatter now always includes an `images` array derived from every image found in the note's raw body text (standard markdown or Obsidian `![[...]]` embeds), so notes no longer need an explicit `cover` frontmatter property. The web app's gallery view reads this array and displays a note's first image as its cover. The `NotesGalleryByMonth` and `NotesGalleryByYear` view components have been removed — use `NotesGallery` instead.

  Removed the `aspectRatio` and `layout` view config fields (from `app.config.json`'s `views`, the `GET /views` response, and the web app's view component props). These had become dead weight: `layout` was never read by any component after an earlier refactor to a CSS masonry grid, and `aspectRatio` only ever sized `NoteCoverGrid`'s pre-load loading skeleton — it did not shape the final rendered card, which sizes itself from the loaded image's natural dimensions. `NoteCoverGrid` now always uses a fixed default skeleton aspect ratio.

  Fixed a bug where a note's external image URL (e.g. `https://...`) in `frontmatter.images` would render as a broken image in the gallery — the web app was always routing it through the local image proxy, which rejects non-local paths. External URLs are now rendered directly, bypassing the proxy. Added a shared `isExternalUrl` helper to `mdm-util` for this check, also adopted by `notes-api`.

  Fixed two smaller edge cases in `frontmatter.images` derivation: a fragment-only image destination (`![alt](#section)`) is no longer surfaced as an image, since it isn't a resolvable image source; and a frontmatter image value with extra whitespace (e.g. from YAML like `" https://... "`) is now trimmed before checking whether it's an external URL, so it no longer gets incorrectly routed through the image proxy.

  Narrowed which external URLs the web app will render directly: only http(s) or protocol-relative URLs bypass the local image proxy now. Any other scheme (`javascript:`, `data:`, `obsidian://`, etc.) renders nothing instead of being passed to `<img src>` unchecked. Added a new `isHttpUrl` helper to `mdm-util` for this.

### Patch Changes

- Updated dependencies [5b101ab]
  - mdm-util@2.3.0

## 2.2.4

### Patch Changes

- mdm-util@2.2.4

## 2.2.3

### Patch Changes

- mdm-util@2.2.3

## 2.2.2

### Patch Changes

- mdm-util@2.2.2

## 2.2.1

### Patch Changes

- mdm-util@2.2.1

## 2.2.0

### Patch Changes

- mdm-util@2.2.0

## 2.1.6

### Patch Changes

- mdm-util@2.1.6

## 2.1.5

### Patch Changes

- mdm-util@2.1.5

## 2.1.4

### Patch Changes

- mdm-util@2.1.4

## 2.1.3

### Patch Changes

- mdm-util@2.1.3

## 2.1.2

### Patch Changes

- mdm-util@2.1.2

## 2.1.1

### Patch Changes

- mdm-util@2.1.1

## 2.1.0

### Patch Changes

- Updated dependencies [2abe52c]
  - mdm-util@2.1.0

## 2.0.2

### Patch Changes

- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2

## 2.0.1

### Patch Changes

- mdm-util@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [fb9cd71]
- Updated dependencies [498a480]
  - mdm-util@2.0.0

## 1.10.0

### Minor Changes

- 4d8fc0e: Refactor app-config package: remove directory traversal in favour of APP_CONFIG_PATH env var, remove AppConfigError, remove HomeStatsShowConfig, extract per-key validators into focused modules with dedicated tests, and move validateAppConfig to its own file with per-property validate functions.

### Patch Changes

- 93a0463: Read `attachmentsDirectory` from `app.config.json` (relative to notes root) instead of the `IMAGES_ROOT` env var. Bare-filename images (no path separator) in note bodies and frontmatter now resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>` when `attachmentsDirectory` is configured.
- Updated dependencies [aad607c]
  - mdm-util@1.10.0

## 1.9.0

### Patch Changes

- mdm-util@1.9.0

## 1.8.0

### Patch Changes

- mdm-util@1.8.0

## 1.7.0

### Patch Changes

- mdm-util@1.7.0

## 1.6.1

### Patch Changes

- 4894c0a: Add optional view groups in app config and render grouped dashboard sections on home.
  - mdm-util@1.6.1

## 1.6.0

### Minor Changes

- 1edfc02: Add an optional `targetScore` to habit configuration (used by `do-less` habits to define green/yellow/red score thresholds for the UI), include `mode`, `targetScore`, and a `scoreEntries` per-entry breakdown of the current score (date, raw value, recency multiplier, and an `obsidianUrl` deep link to the source note) in the `GET /habit/:id` response, and add a new `GET /habits` endpoint that lists every configured habit with its current score, streak, mode, and `targetScore`.
- 6e3255f: Add configurable created-date resolution for notes: `createdDateProperty` sets the frontmatter key to read (default `"created"`), and `deriveTitleDate` enables extracting the date from the note title using configured `dateFormats`. Notes without a resolved created date return `null` for `createdDate` and are excluded from notes-per-day and trend calculations. A new `notesWithoutCreatedDate` stat counts them. Fixes incorrect notes-per-day chart data on Linux Docker deployments where `stat.birthtime` was unreliable.
- be835c4: Implement the `GET /habit/:id` endpoint. Habits are configured in `app.config.json` under a new `habits` array, each with an `id`, `name`, `mode` (`"do-more"` or `"do-less"`), `frontmatterProperty`, and `trackingWindowDays`. The endpoint scans notes for the configured frontmatter property (a numeric value from 1–10) and returns the current rolling-window score, streak, and entry count, plus a point-in-time history for every matching note and all-time highs for score, streak, and tracking-window entries. Scoring sums values from notes within the tracking window (entries from the last 14 days count at a 10x multiplier), then applies an always-positive 0.5%-per-day-with-an-entry adjustment and a 0.5%-per-streak-day adjustment that boosts the score (do-more) or lowers it (do-less).
- ceb2a80: `noteRootDirectory` has been removed from `app.config.json` entirely. The notes directory is now configured exclusively via the `NOTES_ROOT` environment variable. The `imagesRoot` config key has also been removed as it was unused — the image-server already reads `IMAGES_ROOT` from the environment.
- f97b7a0: Expand the stats endpoint with folder counts, attachment counts, folder breakdown, notes created over 30/90/365-day windows, 30-day trend comparison, and daily note counts for the past year. Add `homeStats` config section to `app.config.json` to control which sections are visible.

### Patch Changes

- Updated dependencies [be835c4]
  - mdm-util@1.6.0

## 1.5.0

### Minor Changes

- 7d451d4: Add optional `badges` support to view configuration and propagate it through stats/view rendering so NotesList and NotesReview can show note badges from note properties and frontmatter values (including frontmatter arrays).
- 678abdf: Add support for exclusion filter groups via `$exclude` and missing-property matches via `$missing` in view filters.
- bbc93bc: `noteRootDirectory` has been removed from `app.config.json` entirely. The notes directory is now configured exclusively via the `NOTES_ROOT` environment variable. The `imagesRoot` config key has also been removed as it was unused — the image-server already reads `IMAGES_ROOT` from the environment.

### Patch Changes

- mdm-util@1.5.0

## 1.4.0

### Patch Changes

- mdm-util@1.4.0

## 1.3.0

### Minor Changes

- 947679f: Views in `app.config.json` now require three distinct fields:
  - `id` — the route key used in `GET /notes?view=<id>` and `/notes/:view` routing
  - `name` — human-readable label displayed in the UI
  - `component` — the web component used to render that view route (for example `NotesList` or `NotesReview`)

  The `GET /stats` response includes `id` and `component` alongside `name` and `count` for each view. The web route `/notes/:view` resolves the configured component by `id` and renders it dynamically.

### Patch Changes

- mdm-util@1.3.0

## 1.2.0

### Minor Changes

- bc20358: View filters are now an array of filter objects. Multiple conditions within a single object are AND'd together; multiple objects in the array are OR'd. Existing single-object filters must be wrapped in an array.

### Patch Changes

- mdm-util@1.2.0

## 1.1.0

### Patch Changes

- e41efd1: Add initial Changesets setup for the monorepo, including root scripts, fixed-release configuration, and contributor docs for changelog entries.
- Updated dependencies [e41efd1]
  - mdm-util@1.1.0

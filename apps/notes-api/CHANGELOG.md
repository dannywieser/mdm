# notes-api

## 1.6.1

### Patch Changes

- 4894c0a: Add optional view groups in app config and render grouped dashboard sections on home.
- Updated dependencies [4894c0a]
  - app-config@1.6.1
  - markdown@1.6.1
  - mdm-util@1.6.1

## 1.6.0

### Minor Changes

- 6e3255f: Add configurable created-date resolution for notes: `createdDateProperty` sets the frontmatter key to read (default `"created"`), and `deriveTitleDate` enables extracting the date from the note title using configured `dateFormats`. Notes without a resolved created date return `null` for `createdDate` and are excluded from notes-per-day and trend calculations. A new `notesWithoutCreatedDate` stat counts them. Fixes incorrect notes-per-day chart data on Linux Docker deployments where `stat.birthtime` was unreliable.
- f97b7a0: Expand the stats endpoint with folder counts, attachment counts, folder breakdown, notes created over 30/90/365-day windows, 30-day trend comparison, and daily note counts for the past year. Add `homeStats` config section to `app.config.json` to control which sections are visible.

### Patch Changes

- Updated dependencies [1edfc02]
- Updated dependencies [6e3255f]
- Updated dependencies [be835c4]
- Updated dependencies [be835c4]
- Updated dependencies [ceb2a80]
- Updated dependencies [f97b7a0]
  - app-config@1.6.0
  - mdm-util@1.6.0
  - markdown@1.6.0

## 1.5.0

### Minor Changes

- 7d451d4: Add optional `badges` support to view configuration and propagate it through stats/view rendering so NotesList and NotesReview can show note badges from note properties and frontmatter values (including frontmatter arrays).
- 678abdf: Add support for exclusion filter groups via `$exclude` and missing-property matches via `$missing` in view filters.

### Patch Changes

- Updated dependencies [7d451d4]
- Updated dependencies [678abdf]
- Updated dependencies [bbc93bc]
- Updated dependencies [28e9b81]
  - app-config@1.5.0
  - markdown@1.5.0
  - mdm-util@1.5.0

## 1.4.0

### Patch Changes

- app-config@1.4.0
- markdown@1.4.0
- mdm-util@1.4.0

## 1.3.0

### Minor Changes

- 298b99c: Refactor notes markdown parsing and rendering to use markdown node trees instead of HTML, including Chakra-based markdown rendering and wikilink/image handling updates.
- 947679f: Views in `app.config.json` now require three distinct fields:
  - `id` — the route key used in `GET /notes?view=<id>` and `/notes/:view` routing
  - `name` — human-readable label displayed in the UI
  - `component` — the web component used to render that view route (for example `NotesList` or `NotesReview`)

  The `GET /stats` response includes `id` and `component` alongside `name` and `count` for each view. The web route `/notes/:view` resolves the configured component by `id` and renders it dynamically.

### Patch Changes

- Updated dependencies [298b99c]
- Updated dependencies [947679f]
  - markdown@1.3.0
  - app-config@1.3.0
  - mdm-util@1.3.0

## 1.2.0

### Minor Changes

- bc20358: The `folder` field on notes now contains the full relative path from the vault root (e.g. `daily/briefing`) instead of just the immediate parent directory name. View filters using `folder` can now match nested paths.
- bc20358: View filters are now an array of filter objects. Multiple conditions within a single object are AND'd together; multiple objects in the array are OR'd. Existing single-object filters must be wrapped in an array.
- bc20358: Add a `GET /stats` endpoint returning total note count, notes modified today, and per-view note counts. The web home page now fetches and displays these stats below the notebook icon.

### Patch Changes

- Updated dependencies [bc20358]
  - app-config@1.2.0
  - markdown@1.2.0
  - mdm-util@1.2.0

## 1.1.0

### Minor Changes

- 7e53688: Add Obsidian-style `[[wikilink]]` resolution to the notes pipeline. Matched wikilinks render as clickable `obsidian://` links; unmatched wikilinks render with a dashed underline. The web UI displays linked notes in a collapsible section at the bottom of each card.
- 34f7c72: optimization for note scanning and filtering

### Patch Changes

- e41efd1: Add initial Changesets setup for the monorepo, including root scripts, fixed-release configuration, and contributor docs for changelog entries.
- Updated dependencies [e41efd1]
- Updated dependencies [7e53688]
  - app-config@1.1.0
  - markdown@1.1.0
  - mdm-util@1.1.0

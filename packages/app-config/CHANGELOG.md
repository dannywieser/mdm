# app-config

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

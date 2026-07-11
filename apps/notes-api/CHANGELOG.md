# notes-api

## 2.2.0

### Patch Changes

- app-config@2.2.0
- markdown@2.2.0
- mdm-util@2.2.0
- services@2.1.7

## 2.1.6

### Patch Changes

- app-config@2.1.6
- markdown@2.1.6
- mdm-util@2.1.6
- services@2.1.6

## 2.1.5

### Patch Changes

- app-config@2.1.5
- markdown@2.1.5
- mdm-util@2.1.5
- services@2.1.5

## 2.1.4

### Patch Changes

- 7241f89: Removes the opt-in `watchtower` service and its labels from `docker-compose.yml`. Image updates are now manual only: run `docker compose pull && docker compose up -d --no-build` (or `npm run docker:update`) — `--no-build` avoids falling back to a source build when `docker-compose.yml`'s referenced Dockerfiles aren't present (e.g. a standalone install without a repo checkout).
  - app-config@2.1.4
  - markdown@2.1.4
  - mdm-util@2.1.4
  - services@2.1.4

## 2.1.3

### Patch Changes

- app-config@2.1.3
- markdown@2.1.3
- mdm-util@2.1.3
- services@2.1.3

## 2.1.2

### Patch Changes

- app-config@2.1.2
- markdown@2.1.2
- mdm-util@2.1.2
- services@2.1.2

## 2.1.1

### Patch Changes

- ab3fafb: Adds an opt-in `watchtower` service to `docker-compose.yml`, gated behind a `watchtower` Compose profile (`COMPOSE_PROFILES=watchtower` in `.env`). When enabled, it watches the 6 published `mdm-*` images (labeled explicitly; `redis`/`imgproxy` are left unwatched) and automatically pulls + restarts any container when a new image is published, replacing the need for a cron job or host script to keep a self-hosted deployment on the latest images.
- 48c544d: Switches the opt-in `watchtower` Compose service from `containrrr/watchtower` to `nickfedor/watchtower`, the actively maintained fork. The original image was archived unmaintained in December 2025 and fails against Docker Engine v29+ hosts with `client version 1.25 is too old`, since it ships a Docker client that predates the daemon's new minimum supported API version.
  - app-config@2.1.1
  - markdown@2.1.1
  - mdm-util@2.1.1
  - services@2.1.1

## 2.1.0

### Patch Changes

- Updated dependencies [2abe52c]
- Updated dependencies [2abe52c]
  - services@2.1.0
  - mdm-util@2.1.0
  - app-config@2.1.0
  - markdown@2.1.0

## 2.0.2

### Patch Changes

- b3996b4: All 5 backend services now handle SIGTERM/SIGINT gracefully: they stop accepting new connections, let in-flight requests finish, disconnect Redis where applicable (`flag-manager`, `image-server`), and force-exit after a 10s timeout if something hangs, instead of being hard-killed mid-request. This is implemented via a new shared `startServer` helper in `mdm-util/node` that also consolidates the near-identical `app.listen(...)` + logging boilerplate that was previously duplicated across all 5 `server.ts` files. `mdm-util`'s Redis client wrapper (`mdm-util/redis`) gains a `disconnect` method used during shutdown.
- 306e7bb: The new Trivy scan gate (added in a prior change) was failing on every push: Alpine OS packages (`libcrypto3`/`libssl3`, `musl`, `zlib`) with unpatched known CVEs, plus a full set of HIGH-severity CVEs in packages that turned out to be npm's own bundled dependencies (`glob`, `minimatch`, `tar`, `sigstore`, etc. at `/usr/local/lib/node_modules/npm`), not anything from the apps' own dependency trees. Each Dockerfile's runner stage now runs `apk upgrade` for the latest available OS patches and removes the base image's bundled `npm`/`npx`/`corepack`, since none of these images ever invoke npm at runtime (the container only runs `node dist/server.js`).
- 30c9e02: `GET /notes` previously rescanned and re-read every file in the vault from disk on every request, regardless of `view`/`includeContent`. The vault scan is now cached in memory for 5 minutes (mirroring `stats-service`'s existing cache), shared across all requests and query param combinations, with concurrent cache misses sharing a single in-flight scan. View filtering and markdown body parsing still run per request against the cached scan, since both depend on query params.
- a9c4d83: `/health` on every backend service now verifies its actual dependencies instead of always returning a static `{status:"ok"}`: `notes-api`, `habit-tracker`, `stats-service`, and `image-server` check that their vault/images directory is readable, and `flag-manager` pings Redis. Any of these return `503` with an error message on failure. `mdm-util`'s shared Redis client wrapper (`mdm-util/redis`) gains a `ping` method to support this. `notes-api` and `stats-service` also now fail fast and exit at startup if their config can't be resolved, instead of logging the error and continuing to serve requests in a broken state (matching `flag-manager`/`image-server`'s existing behavior).
- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2
  - app-config@2.0.2
  - markdown@2.0.2
  - services@2.0.2

## 2.0.1

### Patch Changes

- 5e73d92: Rebuild all Docker images as minimal multi-stage builds using `turbo prune` (only ship each app's own dependency subgraph, run as non-root, `NODE_ENV=production`), add a `HEALTHCHECK` to every image so health status works standalone, and publish images to `ghcr.io/dannywieser/mdm-<app>` on every push to `main`. `docker-compose.yml` now references the published images alongside local `build:` config, and `npm run docker:update` pulls and restarts without rebuilding from source.
  - app-config@2.0.1
  - markdown@2.0.1
  - mdm-util@2.0.1
  - services@2.0.1

## 2.0.0

### Major Changes

- fb9cd71: Extract vault statistics into a new dedicated `stats-service` app. `GET /stats` has been removed from `notes-api` (a breaking change); the new `stats-service` exposes `GET /stats/meta`, returning total notes, total folders, total words (counted from note bodies, excluding frontmatter), and total attachments grouped by file extension. `mdm-util` gains `countWords` and `countFilesByExtension` (replacing `countFilesRecursive`) to support the new endpoint.

### Minor Changes

- 492658e: Renamed the `titleOrBodyDates` note property to `dates`, and expanded it to include every date found in a note's title, body, and frontmatter, plus the file's modified date. `createdDate` is now derived as the oldest date in this list instead of preferring a configured frontmatter property.

### Patch Changes

- Updated dependencies [707d12d]
- Updated dependencies [fb9cd71]
- Updated dependencies [492658e]
- Updated dependencies [498a480]
- Updated dependencies [572b5ff]
  - services@2.0.0
  - mdm-util@2.0.0
  - markdown@2.0.0
  - app-config@2.0.0

## 1.10.0

### Patch Changes

- 93a0463: Read `attachmentsDirectory` from `app.config.json` (relative to notes root) instead of the `IMAGES_ROOT` env var. Bare-filename images (no path separator) in note bodies and frontmatter now resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>` when `attachmentsDirectory` is configured.
- 271252d: Refactor config threading: helper functions now retrieve cached config internally instead of receiving values as parameters.
- Updated dependencies [4d8fc0e]
- Updated dependencies [93a0463]
- Updated dependencies [aad607c]
  - app-config@1.10.0
  - mdm-util@1.10.0
  - services@1.8.2
  - markdown@1.10.0

## 1.9.0

### Minor Changes

- 8e352f2: Replace morgan and console logging with Pino structured JSON logging across all backend services. Log level is controlled via the `LOG_LEVEL` environment variable (default: `info`).

### Patch Changes

- 3942cd8: Add stricter ESLint rule sets (strictTypeChecked, sonarjs, jsx-a11y, vitest, n) and fix all resulting errors across the monorepo.
- bede171: Fix cover frontmatter image paths not being resolved to the attachments directory, causing broken cover images in the web app.
  - app-config@1.9.0
  - markdown@1.9.0
  - mdm-util@1.9.0
  - services@1.8.1

## 1.8.0

### Minor Changes

- e476e6f: Add a dedicated `GET /views` endpoint that lists configured views along with the matching note IDs and counts, and remove the `views` property from the `/stats` response. The web app now fetches views from the new endpoint.

### Patch Changes

- da76fb7: Add a search input to the header on the notes gallery view that filters note cards by matching keywords against the title, frontmatter, and full note body text. The `/notes` API response now includes a `fullText` field on each note containing its raw markdown body.
- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.
- Updated dependencies [da76fb7]
- Updated dependencies [957fdaa]
  - markdown@1.8.0
  - services@1.8.0
  - app-config@1.8.0
  - mdm-util@1.8.0

## 1.7.0

### Patch Changes

- 7399c56: Add an `includeContent=false` query param to `GET /notes` that skips remark parsing of note bodies, and use it for the gallery views which only need frontmatter.
- 88032d0: Moved shared markdown file-loading helpers (`collectMarkdownFiles`, `buildObsidianUrl`, `resolveDateFromFrontmatterOrTitle`) into the `markdown` package and updated `notes-api` and `habit-tracker` to use them, removing duplicated implementations.
- Updated dependencies [88032d0]
  - markdown@1.7.0
  - app-config@1.7.0
  - mdm-util@1.7.0

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

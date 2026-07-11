# habit-tracker

## 1.3.12

### Patch Changes

- app-config@2.2.0
- markdown@2.2.0
- mdm-util@2.2.0
- services@2.1.7

## 1.3.11

### Patch Changes

- app-config@2.1.6
- markdown@2.1.6
- mdm-util@2.1.6
- services@2.1.6

## 1.3.10

### Patch Changes

- app-config@2.1.5
- markdown@2.1.5
- mdm-util@2.1.5
- services@2.1.5

## 1.3.9

### Patch Changes

- 7241f89: Removes the opt-in `watchtower` service and its labels from `docker-compose.yml`. Image updates are now manual only: run `docker compose pull && docker compose up -d --no-build` (or `npm run docker:update`) — `--no-build` avoids falling back to a source build when `docker-compose.yml`'s referenced Dockerfiles aren't present (e.g. a standalone install without a repo checkout).
  - app-config@2.1.4
  - markdown@2.1.4
  - mdm-util@2.1.4
  - services@2.1.4

## 1.3.8

### Patch Changes

- app-config@2.1.3
- markdown@2.1.3
- mdm-util@2.1.3
- services@2.1.3

## 1.3.7

### Patch Changes

- app-config@2.1.2
- markdown@2.1.2
- mdm-util@2.1.2
- services@2.1.2

## 1.3.6

### Patch Changes

- ab3fafb: Adds an opt-in `watchtower` service to `docker-compose.yml`, gated behind a `watchtower` Compose profile (`COMPOSE_PROFILES=watchtower` in `.env`). When enabled, it watches the 6 published `mdm-*` images (labeled explicitly; `redis`/`imgproxy` are left unwatched) and automatically pulls + restarts any container when a new image is published, replacing the need for a cron job or host script to keep a self-hosted deployment on the latest images.
- 48c544d: Switches the opt-in `watchtower` Compose service from `containrrr/watchtower` to `nickfedor/watchtower`, the actively maintained fork. The original image was archived unmaintained in December 2025 and fails against Docker Engine v29+ hosts with `client version 1.25 is too old`, since it ships a Docker client that predates the daemon's new minimum supported API version.
  - app-config@2.1.1
  - markdown@2.1.1
  - mdm-util@2.1.1
  - services@2.1.1

## 1.3.5

### Patch Changes

- Updated dependencies [2abe52c]
- Updated dependencies [2abe52c]
  - services@2.1.0
  - mdm-util@2.1.0
  - app-config@2.1.0
  - markdown@2.1.0

## 1.3.4

### Patch Changes

- b3996b4: All 5 backend services now handle SIGTERM/SIGINT gracefully: they stop accepting new connections, let in-flight requests finish, disconnect Redis where applicable (`flag-manager`, `image-server`), and force-exit after a 10s timeout if something hangs, instead of being hard-killed mid-request. This is implemented via a new shared `startServer` helper in `mdm-util/node` that also consolidates the near-identical `app.listen(...)` + logging boilerplate that was previously duplicated across all 5 `server.ts` files. `mdm-util`'s Redis client wrapper (`mdm-util/redis`) gains a `disconnect` method used during shutdown.
- 306e7bb: The new Trivy scan gate (added in a prior change) was failing on every push: Alpine OS packages (`libcrypto3`/`libssl3`, `musl`, `zlib`) with unpatched known CVEs, plus a full set of HIGH-severity CVEs in packages that turned out to be npm's own bundled dependencies (`glob`, `minimatch`, `tar`, `sigstore`, etc. at `/usr/local/lib/node_modules/npm`), not anything from the apps' own dependency trees. Each Dockerfile's runner stage now runs `apk upgrade` for the latest available OS patches and removes the base image's bundled `npm`/`npx`/`corepack`, since none of these images ever invoke npm at runtime (the container only runs `node dist/server.js`).
- a9c4d83: `/health` on every backend service now verifies its actual dependencies instead of always returning a static `{status:"ok"}`: `notes-api`, `habit-tracker`, `stats-service`, and `image-server` check that their vault/images directory is readable, and `flag-manager` pings Redis. Any of these return `503` with an error message on failure. `mdm-util`'s shared Redis client wrapper (`mdm-util/redis`) gains a `ping` method to support this. `notes-api` and `stats-service` also now fail fast and exit at startup if their config can't be resolved, instead of logging the error and continuing to serve requests in a broken state (matching `flag-manager`/`image-server`'s existing behavior).
- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2
  - app-config@2.0.2
  - markdown@2.0.2
  - services@2.0.2

## 1.3.3

### Patch Changes

- 5e73d92: Rebuild all Docker images as minimal multi-stage builds using `turbo prune` (only ship each app's own dependency subgraph, run as non-root, `NODE_ENV=production`), add a `HEALTHCHECK` to every image so health status works standalone, and publish images to `ghcr.io/dannywieser/mdm-<app>` on every push to `main`. `docker-compose.yml` now references the published images alongside local `build:` config, and `npm run docker:update` pulls and restarts without rebuilding from source.
  - app-config@2.0.1
  - markdown@2.0.1
  - mdm-util@2.0.1
  - services@2.0.1

## 1.3.2

### Patch Changes

- 707d12d: Fix `EMFILE: too many open files` errors when scanning large vaults: habit entry scanning now reads note files with bounded concurrency (via `mapWithConcurrency` from `mdm-util`) instead of opening every note at once per habit.
- 781fcee: Fix two habit-tracking calculations: a "do-more" streak now requires at least 2 consecutive logged days before it's reported (a single logged day no longer shows as a streak of 1), and "fewest days tracked per period" now discards the oldest tracking period when it started partway through a window instead of counting it as-is, so an incomplete leading window no longer produces an artificially low score.
- Updated dependencies [707d12d]
- Updated dependencies [fb9cd71]
- Updated dependencies [492658e]
- Updated dependencies [498a480]
- Updated dependencies [572b5ff]
  - services@2.0.0
  - mdm-util@2.0.0
  - markdown@2.0.0
  - app-config@2.0.0

## 1.3.1

### Patch Changes

- 271252d: Refactor config threading: helper functions now retrieve cached config internally instead of receiving values as parameters.
- Updated dependencies [4d8fc0e]
- Updated dependencies [93a0463]
- Updated dependencies [aad607c]
  - app-config@1.10.0
  - mdm-util@1.10.0
  - services@1.8.2
  - markdown@1.10.0

## 1.3.0

### Minor Changes

- 8e352f2: Replace morgan and console logging with Pino structured JSON logging across all backend services. Log level is controlled via the `LOG_LEVEL` environment variable (default: `info`).
- dbc54d9: Switch streak and days-logged bonuses to a tiered rate (0.5% for days 1–5, 0.6% for days 6–10, etc.) and expose a per-tier score breakdown in the habit detail collapsible section.

### Patch Changes

- 3942cd8: Add stricter ESLint rule sets (strictTypeChecked, sonarjs, jsx-a11y, vitest, n) and fix all resulting errors across the monorepo.
- 93c23d9: Add `lowestDaysTrackedPerPeriod` stat to the habit detail response for do-less habits.
  - app-config@1.9.0
  - markdown@1.9.0
  - mdm-util@1.9.0
  - services@1.8.1

## 1.2.1

### Patch Changes

- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.
- Updated dependencies [da76fb7]
- Updated dependencies [957fdaa]
  - markdown@1.8.0
  - services@1.8.0
  - app-config@1.8.0
  - mdm-util@1.8.0

## 1.2.0

### Minor Changes

- 88032d0: Renamed the `GET /habit/:id` endpoint to `GET /habits/:id` for REST consistency with `GET /habits`, and consolidated the `habit` and `habits` handler folders into `habits` and `habit-detail`.

### Patch Changes

- 88032d0: Moved shared markdown file-loading helpers (`collectMarkdownFiles`, `buildObsidianUrl`, `resolveDateFromFrontmatterOrTitle`) into the `markdown` package and updated `notes-api` and `habit-tracker` to use them, removing duplicated implementations.
- Updated dependencies [88032d0]
  - markdown@1.7.0
  - app-config@1.7.0
  - mdm-util@1.7.0

## 1.1.1

### Patch Changes

- 077d2eb: Redesign the home page habit cards as multi-stat boxes showing habit score, streak, and total days, prefix the title with "do more"/"do less", and show heat dots for over-target do-less habits (matching the detail page). Add `windowEntries` to the `/habits` list response to support the new "total days" stat.
- 077d2eb: Add a percentage badge next to "days logged" on the habit detail page showing how full the current tracking window is (logged days / window size). The `/habit/:id` response now includes `trackingWindowDays` to support this.
- Updated dependencies [4894c0a]
  - app-config@1.6.1
  - markdown@1.6.1
  - mdm-util@1.6.1

## 1.1.0

### Minor Changes

- 1edfc02: Add an optional `targetScore` to habit configuration (used by `do-less` habits to define green/yellow/red score thresholds for the UI), include `mode`, `targetScore`, and a `scoreEntries` per-entry breakdown of the current score (date, raw value, recency multiplier, and an `obsidianUrl` deep link to the source note) in the `GET /habit/:id` response, and add a new `GET /habits` endpoint that lists every configured habit with its current score, streak, mode, and `targetScore`.
- be835c4: Implement the `GET /habit/:id` endpoint. Habits are configured in `app.config.json` under a new `habits` array, each with an `id`, `name`, `mode` (`"do-more"` or `"do-less"`), `frontmatterProperty`, and `trackingWindowDays`. The endpoint scans notes for the configured frontmatter property (a numeric value from 1–10) and returns the current rolling-window score, streak, and entry count, plus a point-in-time history for every matching note and all-time highs for score, streak, and tracking-window entries. Scoring sums values from notes within the tracking window (entries from the last 14 days count at a 10x multiplier), then applies an always-positive 0.5%-per-day-with-an-entry adjustment and a 0.5%-per-streak-day adjustment that boosts the score (do-more) or lowers it (do-less).

### Patch Changes

- be835c4: Fix `GET /habit/:id` failing to count entries whose frontmatter property value is wrapped in quotes (for example `drinking: "3"`). The quoted string was passed directly to `parseFloat`, which returned `NaN` and caused the entry to be silently dropped.
- be835c4: Floor `GET /habit/:id` scores (current score and history scores) to whole numbers, correcting for floating-point representation noise so values like `524.9999999999999` floor to the mathematically exact `525` rather than `524`.
- be835c4: Fix the sign of the `streakMultiplier` and `dayMultiplier` score contributions for `do-less` habits in the `GET /habit/:id` response. `dayMultiplier` is now always positive in both modes (more days with entries always raises the score before the streak adjustment), while `streakMultiplier` is positive for `do-more` habits and negative for `do-less` habits (a long gap since the last entry now lowers the score, as intended).
- be835c4: Change `history` in the `GET /habit/:id` response to include one record for every calendar day from the first matching note through today (rather than only days with a logged entry), so it can be plotted as a continuous score-over-time graph. Days with no logged entry have `value: 0` and a score computed normally as of that day. Each `history` entry now also includes `streak`, the streak as of that day.
- be835c4: Add a dedicated `streaks` block to the `GET /habit/:id` response describing historical streak periods (`start`/`end`/`length`): for `do-more` habits these are periods of consecutive logged days, and for `do-less` habits these are gaps of consecutive unlogged days that fall strictly between two logged entries. The top-level `streak` field continues to reflect the current streak (consecutive logged days for `do-more`, days since the last entry for `do-less`), and `allTimeHighStreak` is now derived from the longest entry in `streaks`.
- be835c4: Change how `dayMultiplier` and `streakMultiplier` combine in the `GET /habit/:id` score formula: `habitScore` is now `floor(scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier))` (multiplicative) rather than `floor(scoreBeforeMultipliers * (1 + dayMultiplier + streakMultiplier))` (additive), so the result matches the original ad-hoc scoring logic. The two approaches agree in most cases but can differ by 1 near floor boundaries due to the cross term between the two adjustments.
- be835c4: Add a score breakdown to the `GET /habit/:id` response — `rawScore` (entry values with no recency multiplier), `recentEntryAdditions` (the extra amount contributed by entries within the last 14 days), `scoreBeforeMultipliers` (`rawScore + recentEntryAdditions`), `streakMultiplier` (positive for `do-more` habits, negative for `do-less` habits), and `dayMultiplier` (always positive, reflecting how many days in the window have a logged entry) are now included on both the current score and every `history` entry. Each `history` entry also now includes `value`, the frontmatter value logged on that day.
- be835c4: Rename `score` to `habitScore`, `totalScore` to `scoreBeforeMultipliers`, and `totalEntries` to `windowEntries` in the `GET /habit/:id` response — both at the top level and (where applicable) in each `history` entry — to better reflect what each value represents.
- Updated dependencies [1edfc02]
- Updated dependencies [6e3255f]
- Updated dependencies [be835c4]
- Updated dependencies [be835c4]
- Updated dependencies [ceb2a80]
- Updated dependencies [f97b7a0]
  - app-config@1.6.0
  - mdm-util@1.6.0
  - markdown@1.6.0

## 1.0.0

### Major Changes

- Added the initial Express-based habit tracker stub with health and placeholder habit endpoints.

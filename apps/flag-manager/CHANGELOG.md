# flag-manager

## 1.1.3

### Patch Changes

- 5e73d92: Rebuild all Docker images as minimal multi-stage builds using `turbo prune` (only ship each app's own dependency subgraph, run as non-root, `NODE_ENV=production`), add a `HEALTHCHECK` to every image so health status works standalone, and publish images to `ghcr.io/dannywieser/mdm-<app>` on every push to `main`. `docker-compose.yml` now references the published images alongside local `build:` config, and `npm run docker:update` pulls and restarts without rebuilding from source.
  - app-config@2.0.1
  - mdm-util@2.0.1
  - services@2.0.1

## 1.1.2

### Patch Changes

- Updated dependencies [707d12d]
- Updated dependencies [fb9cd71]
- Updated dependencies [498a480]
- Updated dependencies [572b5ff]
  - services@2.0.0
  - mdm-util@2.0.0
  - app-config@2.0.0

## 1.1.1

### Patch Changes

- Updated dependencies [4d8fc0e]
- Updated dependencies [93a0463]
- Updated dependencies [aad607c]
  - app-config@1.10.0
  - mdm-util@1.10.0
  - services@1.8.2

## 1.1.0

### Minor Changes

- 8e352f2: Replace morgan and console logging with Pino structured JSON logging across all backend services. Log level is controlled via the `LOG_LEVEL` environment variable (default: `info`).

### Patch Changes

- 3942cd8: Add stricter ESLint rule sets (strictTypeChecked, sonarjs, jsx-a11y, vitest, n) and fix all resulting errors across the monorepo.
  - app-config@1.9.0
  - mdm-util@1.9.0
  - services@1.8.1

## 1.0.9

### Patch Changes

- 957fdaa: Add a shared `services` package with per-domain (notes, habits, flags, images) response types and React Query hooks, removing duplicated and drifted type definitions from `apps/web` and the API apps. The web app now consumes shared `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, and `useToggleNoteRead` hooks, and `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager` re-export their wire-shape types from `services` so handler outputs are checked against the shared contract. The habit history/score API responses now consistently include the full set of fields (`windowEntries`, `windowStart`, `rawScore`, `scoreBeforeMultipliers`, `streakMultiplier`, `dayMultiplier`, `recentEntryAdditions`) that were previously typed inconsistently between client and server.
- Updated dependencies [957fdaa]
  - services@1.8.0
  - app-config@1.8.0
  - mdm-util@1.8.0

## 1.0.8

### Patch Changes

- app-config@1.7.0
- mdm-util@1.7.0

## 1.0.7

### Patch Changes

- mdm-util@1.6.1

## 1.0.6

### Patch Changes

- Updated dependencies [be835c4]
  - mdm-util@1.6.0

## 1.0.5

### Patch Changes

- mdm-util@1.5.0

## 1.0.4

### Patch Changes

- mdm-util@1.4.0

## 1.0.3

### Patch Changes

- mdm-util@1.3.0

## 1.0.2

### Patch Changes

- mdm-util@1.2.0

## 1.0.1

### Patch Changes

- Updated dependencies [e41efd1]
  - mdm-util@1.1.0

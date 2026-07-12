# demo-data

## 1.1.13

### Patch Changes

- mdm-util@2.2.3
- notes-api@2.2.3
- habit-tracker@1.3.15
- stats-service@1.1.10

## 1.1.12

### Patch Changes

- mdm-util@2.2.2
- notes-api@2.2.2
- habit-tracker@1.3.14
- stats-service@1.1.9

## 1.1.11

### Patch Changes

- mdm-util@2.2.1
- notes-api@2.2.1
- habit-tracker@1.3.13
- stats-service@1.1.8

## 1.1.10

### Patch Changes

- mdm-util@2.2.0
- notes-api@2.2.0
- habit-tracker@1.3.12
- stats-service@1.1.7

## 1.1.9

### Patch Changes

- mdm-util@2.1.6
- notes-api@2.1.6
- habit-tracker@1.3.11
- stats-service@1.1.6

## 1.1.8

### Patch Changes

- mdm-util@2.1.5
- notes-api@2.1.5
- habit-tracker@1.3.10
- stats-service@1.1.5

## 1.1.7

### Patch Changes

- Updated dependencies [7241f89]
  - notes-api@2.1.4
  - habit-tracker@1.3.9
  - stats-service@1.1.4
  - mdm-util@2.1.4

## 1.1.6

### Patch Changes

- mdm-util@2.1.3
- notes-api@2.1.3
- habit-tracker@1.3.8
- stats-service@1.1.3

## 1.1.5

### Patch Changes

- mdm-util@2.1.2
- notes-api@2.1.2
- habit-tracker@1.3.7
- stats-service@1.1.2

## 1.1.4

### Patch Changes

- Updated dependencies [ab3fafb]
- Updated dependencies [48c544d]
  - notes-api@2.1.1
  - habit-tracker@1.3.6
  - stats-service@1.1.1
  - mdm-util@2.1.1

## 1.1.3

### Patch Changes

- 2abe52c: Add a GitHub-style activity graph to the `/stats` page — one square per day, shaded by how many notes were created and modified that day, sourced from the new `GET /stats/history` endpoint. Adds a `useStatsHistory` hook and `StatsHistoryResponse`/`StatsHistoryEntry` types to `services`.
- Updated dependencies [2abe52c]
  - stats-service@1.1.0
  - mdm-util@2.1.0
  - habit-tracker@1.3.5
  - notes-api@2.1.0

## 1.1.2

### Patch Changes

- Updated dependencies [b3996b4]
- Updated dependencies [306e7bb]
- Updated dependencies [30c9e02]
- Updated dependencies [a9c4d83]
  - notes-api@2.0.2
  - habit-tracker@1.3.4
  - stats-service@1.0.2
  - mdm-util@2.0.2

## 1.1.1

### Patch Changes

- Updated dependencies [5e73d92]
  - notes-api@2.0.1
  - habit-tracker@1.3.3
  - stats-service@1.0.1
  - mdm-util@2.0.1

## 1.1.0

### Minor Changes

- 707d12d: Add a static demo mode and GitHub Pages deployment. `services` gains `configureDemoMode`, which switches the query hooks to pre-built static JSON files, swaps the redis-backed read-flag hooks for per-session browser storage, and maps image URLs to static cover files. `web` bootstraps demo mode via `VITE_DEMO_MODE`, supports sub-path hosting via `VITE_BASE_PATH` (router basename included), and adds a `dev:demo` script. The new `demo-data` app generates a deterministic 1500+ note demo vault (journal with habit data, photos, books, movies, quotes, ideas, projects, recipes, people, plus SVG covers) and snapshots the real `notes-api`/`habit-tracker`/`stats-service` responses into `apps/web/public/demo-data`; `.github/workflows/deploy-pages.yml` regenerates and deploys the demo to GitHub Pages daily and on pushes to `main`. Demo covers vary in decoration motif, palette, and (for photos/recipes) aspect ratio to show off the masonry galleries. In demo mode the "open in Obsidian" button instead opens an in-browser note source page with an explanatory info alert.

### Patch Changes

- Updated dependencies [707d12d]
- Updated dependencies [fb9cd71]
- Updated dependencies [781fcee]
- Updated dependencies [492658e]
- Updated dependencies [498a480]
  - habit-tracker@1.3.2
  - notes-api@2.0.0
  - stats-service@1.0.0
  - mdm-util@2.0.0

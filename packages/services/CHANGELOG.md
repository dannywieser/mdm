# services

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

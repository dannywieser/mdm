# services

Shared TypeScript types and React Query hooks for the mdm backend services (notes, habits, flags, images, stats). This package is the single source of truth for response shapes returned by `apps/notes-api`, `apps/habit-tracker`, `apps/flag-manager`, and `apps/stats-service`, and for the hooks `apps/web` (and any future web app) uses to fetch that data.

## Usage

Call the relevant `set*BaseUrl` functions once at app startup, before rendering:

```ts
import { setBaseUrl, setFlagsBaseUrl, setHabitsBaseUrl, setImagesBaseUrl, setStatsBaseUrl } from "services"

setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "/api")
setHabitsBaseUrl(import.meta.env.VITE_HABIT_API_BASE_URL ?? "")
setFlagsBaseUrl(import.meta.env.VITE_FLAGS_BASE_URL ?? "/flags")
setImagesBaseUrl(import.meta.env.VITE_IMAGES_BASE_URL ?? "")
setStatsBaseUrl(import.meta.env.VITE_STATS_BASE_URL ?? "/stats")
```

Then use the hooks and types as normal, e.g. `useNotesQuery`, `useViewsQuery`, `useStatsMeta`, `useStatsHistory`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, `useToggleNoteRead`, `buildImageUrl`.

Hooks throw `Error` objects whose `message` is an i18n key (e.g. `"errors.unableToLoadViews"`) rather than localized text, so consuming apps can translate the message themselves.

## Demo mode

For fully static deployments (e.g. the GitHub Pages demo) call `configureDemoMode` instead of the `set*BaseUrl` functions:

```ts
import { configureDemoMode } from "services"

configureDemoMode({ dataBasePath: `${import.meta.env.BASE_URL}demo-data` })
```

In demo mode:

- The query hooks fetch pre-built static JSON files from `dataBasePath` (`views.json`, `stats.meta.json`, `stats.history.json`, `habits.json`, `habit.<id>.json`, `notes.<view>.json` / `notes.<view>.slim.json`) instead of calling the live services. The files are produced by `apps/demo-data`.
- `useIsRead` / `useToggleRead` swap the redis-backed flag-manager HTTP calls for browser `sessionStorage` (key format `mdm-demo-flag:<flag>:<noteId>`), so read-state is temporary and per-session.
- `buildImageUrl` maps vault-relative image paths to static files under `<dataBasePath>/images/` instead of the image-server proxy.
- `useNoteSourceQuery` (demo-only) loads a note's raw markdown from `<dataBasePath>/source/<noteId>.md`, backing the web app's in-browser note source page that replaces Obsidian deep links in demo mode.

## Structure

- `notes/` — `Note`/`NotesResponse`, `ViewSummary`/`ViewsResponse` and the hooks that fetch them from `apps/notes-api`, plus the note "read" flag hooks (`useIsRead`, `useToggleNoteRead`).
- `stats/` — `StatsMetaResponse`/`StatsHistoryResponse` and the `useStatsMeta`/`useStatsHistory` hooks that fetch them from `apps/stats-service`.
- `habits/` — `HabitSummary`/`HabitResult` and the hooks that fetch them from `apps/habit-tracker`.
- `flags/` — `ToggleFlagInput`/`ToggleFlagResult` shared with `apps/flag-manager`.
- `images/` — `buildImageUrl` helper for the `apps/image-server` image proxy.
- `demo/` — `configureDemoMode`/`isDemoMode`, the `mdm-demo-flag:*` sessionStorage-backed read flags, and the `buildDemo*Url` helpers that point the query hooks at the static snapshot instead of live services.
- `config.ts` — module-level base URL configuration for each backend service.

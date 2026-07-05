# services

Shared TypeScript types and React Query hooks for the mdm backend services (notes, habits, flags, images). This package is the single source of truth for response shapes returned by `apps/notes-api`, `apps/habit-tracker`, and `apps/flag-manager`, and for the hooks `apps/web` (and any future web app) uses to fetch that data.

## Usage

Call the relevant `set*BaseUrl` functions once at app startup, before rendering:

```ts
import { setBaseUrl, setHabitsBaseUrl, setFlagsBaseUrl, setImagesBaseUrl } from "services"

setBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "/api")
setHabitsBaseUrl(import.meta.env.VITE_HABIT_API_BASE_URL ?? "")
setFlagsBaseUrl(import.meta.env.VITE_FLAGS_BASE_URL ?? "/flags")
setImagesBaseUrl(import.meta.env.VITE_IMAGES_BASE_URL ?? "")
```

Then use the hooks and types as normal, e.g. `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, `useToggleNoteRead`, `buildImageUrl`.

Hooks throw `Error` objects whose `message` is an i18n key (e.g. `"errors.unableToLoadViews"`) rather than localized text, so consuming apps can translate the message themselves.

## Demo mode

For fully static deployments (e.g. the GitHub Pages demo) call `configureDemoMode` instead of the `set*BaseUrl` functions:

```ts
import { configureDemoMode } from "services"

configureDemoMode({ dataBasePath: `${import.meta.env.BASE_URL}demo-data` })
```

In demo mode:

- The query hooks fetch pre-built static JSON files from `dataBasePath` (`views.json`, `habits.json`, `habit.<id>.json`, `notes.<view>.json` / `notes.<view>.slim.json`) instead of calling the live services. The files are produced by `apps/demo-data`. (No stats snapshot is generated while the web app still targets the legacy `/stats` shape; the demo hides the stats page.)
- `useIsRead` / `useToggleRead` swap the redis-backed flag-manager HTTP calls for browser `sessionStorage` (key format `mdm-demo-flag:<flag>:<noteId>`), so read-state is temporary and per-session.
- `buildImageUrl` maps vault-relative image paths to static files under `<dataBasePath>/images/` instead of the image-server proxy.

## Structure

- `notes/` — `Note`/`NotesResponse`, `ViewSummary`/`ViewsResponse`, `StatsResponse` and the hooks that fetch them from `apps/notes-api`, plus the note "read" flag hooks (`useIsRead`, `useToggleNoteRead`).
- `habits/` — `HabitSummary`/`HabitResult` and the hooks that fetch them from `apps/habit-tracker`.
- `flags/` — `ToggleFlagInput`/`ToggleFlagResult` shared with `apps/flag-manager`.
- `images/` — `buildImageUrl` helper for the `apps/image-server` image proxy.
- `config.ts` — module-level base URL configuration for each backend service.

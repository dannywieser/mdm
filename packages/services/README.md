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

Then use the hooks and types as normal, e.g. `useNotesQuery`, `useViewsQuery`, `useStatsQuery`, `useHabitsQuery`, `useHabitQuery`, `useIsRead`, `useToggleNoteRead`, `buildImageUrl`.

Hooks throw `Error` objects whose `message` is an i18n key (e.g. `"errors.unableToLoadViews"`) rather than localized text, so consuming apps can translate the message themselves.

## Structure

- `notes/` — `Note`/`NotesResponse`, `ViewSummary`/`ViewsResponse` and the hooks that fetch them from `apps/notes-api`, plus the note "read" flag hooks (`useIsRead`, `useToggleNoteRead`).
- `stats/` — `StatsMetaResponse` and the `useStatsQuery` hook that fetches it from `apps/stats-service`.
- `habits/` — `HabitSummary`/`HabitResult` and the hooks that fetch them from `apps/habit-tracker`.
- `flags/` — `ToggleFlagInput`/`ToggleFlagResult` shared with `apps/flag-manager`.
- `images/` — `buildImageUrl` helper for the `apps/image-server` image proxy.
- `config.ts` — module-level base URL configuration for each backend service.

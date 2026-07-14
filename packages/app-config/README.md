# app-config

Reads and validates the repository's `app.config.json`, combining it with the `NOTES_ROOT` environment variable into a single resolved, cached config object consumed by every backend service (`notes-api`, `flag-manager`, `habit-tracker`, `stats-service`). Depends only on `mdm-util`.

## Usage

```ts
import { resolveNotesConfig } from "app-config"
import type { ResolvedNotesConfig, AppConfig, HabitConfig, HabitMode, NotesView, ViewFilter, ExcludeViewFilter } from "app-config"

const { notesDirectory, obsidianVault, dateFormats, timezone, createdDateProperty, attachmentsDirectory, habits, views } = await resolveNotesConfig()
```

- `resolveNotesConfig()` reads `app.config.json` (from `APP_CONFIG_PATH`, or `<cwd>/app.config.json` if unset), validates it, and merges in the required `NOTES_ROOT` env var as `notesDirectory`. The result is cached in module state after the first successful call — the file is only read and validated once per process.
- Validation failures throw a plain `Error` with a message describing exactly what's wrong (missing file, invalid JSON, missing `obsidianVault`, malformed `habits`/`views` entries, etc.) — these are the messages surfaced in each service's `500` error responses.
- `readAppConfigFile()` is exported separately for callers that need the raw (unvalidated) parsed JSON.
- `./testing` subpath export: `createMockNotesConfig(overrides?)` builds a complete `ResolvedNotesConfig` with sensible defaults for tests, so test setup only needs to override the fields it cares about.

## Structure

- `index.ts` — `resolveNotesConfig` (with its module-level cache) and `readAppConfigFile` re-export.
- `readAppConfigFile.ts` — reads and JSON-parses the config file, translating filesystem/parse errors into the messages above.
- `validateAppConfig/validateAppConfig.ts` — validates the top-level shape (`obsidianVault`, `attachmentsDirectory`, `dateFormats`, `timezone`) and delegates to the habits/views validators.
- `habits/habits.ts` — validates the `habits` array (`id`, `name`, `mode`, `frontmatterProperty`, positive-integer `trackingWindowDays`, optional positive `targetScore`).
- `views/views.ts` — validates the `views` array (`id`, `name`, `component`, optional `badges`/`frontmatterFilters`/`group`, and `filters` as string-record or `$exclude` objects).
- `testing.ts` — `createMockNotesConfig`, exposed via the `./testing` subpath.
- `types.ts` — `AppConfig`, `AppConfigView`, `ResolvedNotesConfig`, `HabitConfig`, `HabitMode`, `NotesView`, `ViewFilter`, `ExcludeViewFilter`.

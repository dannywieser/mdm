# app-config

Reads and validates the repository's `app.config.json`, combining it with the `NOTES_ROOT` environment variable into a single resolved, cached config object consumed by every backend service (`notes-api`, `flag-manager`, `habit-tracker`, `stats-service`). Depends only on `mdm-util`.

## Usage

```ts
import { resolveNotesConfig } from "app-config"
import type { ResolvedNotesConfig, AppConfig, HabitConfig, HabitMode, NotesView, ViewFilter, ExcludeViewFilter } from "app-config"

const { notesDirectory, obsidianVault, dateFormats, timezone, createdDateProperty, attachmentsDirectory, habits, transactions, views } = await resolveNotesConfig()
```

- `resolveNotesConfig()` reads `app.config.json` (from `APP_CONFIG_PATH`, or `<cwd>/app.config.json` if unset), validates it, and merges in the required `NOTES_ROOT` env var as `notesDirectory`. The result is cached in module state after the first successful call — the file is only read and validated once per process.
- `notesSource` (optional, `"obsidian"` or `"bear"`, defaults to `"obsidian"`) selects which note source `notes-api` reads from; see `apps/notes-api/README.md` for the difference in behavior. Only `notes-api` reads this field — every other service in the resolved config still assumes an Obsidian-style vault.
- Validation failures throw a plain `Error` with a message describing exactly what's wrong (missing file, invalid JSON, missing `obsidianVault`, malformed `habits`/`transactions`/`views` entries, etc.) — these are the messages surfaced in each service's `500` error responses.
- `readAppConfigFile()` is exported separately for callers that need the raw (unvalidated) parsed JSON.
- `./testing` subpath export: `createMockNotesConfig(overrides?)` builds a complete `ResolvedNotesConfig` with sensible defaults for tests, so test setup only needs to override the fields it cares about.

## Structure

- `index.ts` — `resolveNotesConfig` (with its module-level cache) and `readAppConfigFile` re-export.
- `readAppConfigFile.ts` — reads and JSON-parses the config file, translating filesystem/parse errors into the messages above.
- `validateAppConfig/validateAppConfig.ts` — validates the top-level shape (`obsidianVault`, `attachmentsDirectory`, `dateFormats`, `timezone`, `notesSource`) and delegates to the habits/transactions/views validators.
- `habits/habits.ts` — validates the `habits` array (`id`, `name`, `mode`, `frontmatterProperty`, positive-integer `trackingWindowDays`, optional positive `targetScore`).
- `transactions/transactions.ts` — validates the optional `transactions` block and fills every unset field from `DEFAULT_TRANSACTIONS_CONFIG`, so the block can be omitted entirely. Names the frontmatter properties `apps/transaction-tracker` reads (`amountProperty`, `dateProperty`, `descriptionProperty`, `categoryProperty`, `recurrenceProperty`, `recurrenceEndProperty`), the display `currency`, and an optional `folder` restricting the scan to one vault directory.
- `views/views.ts` — validates the `views` array (`id`, `name`, `component`, optional `badges`/`notesGalleryFilters`/`group`, optional boolean `dashboardPreview`, and `filters` as string-record or `$exclude` objects).
- `testing.ts` — `createMockNotesConfig`, exposed via the `./testing` subpath.
- `types.ts` — `AppConfig`, `AppConfigView`, `ResolvedNotesConfig`, `NotesSource`, `HabitConfig`, `HabitMode`, `NotesView`, `ViewFilter`, `ExcludeViewFilter`.

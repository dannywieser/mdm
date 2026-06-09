# mdm

This repository is a Turborepo monorepo with this structure:

- `apps/` for runnable applications
- `packages/` for shared packages

## Current apps

- `apps/notes-api`: Express-based Node service with request logging via `morgan`.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /notes`
    - Purpose: recursively load `*.md` and `*.markdown` files from the directory resolved by `noteRootDirectory` + `obsidianVault` in `app.config.json`, extract optional frontmatter metadata, extract title/body dates using configured `dateFormats`, parse markdown into a node tree, and return note metadata
    - Optional query: `view=<id>` to apply a configured notes view filter by view ID
    - Success response: `200`
      ```json
      {
        "notesDirectory": "/absolute/path/to/notes/vault-name",
        "obsidianVault": "vault-name",
        "notes": [
          {
            "createdDate": "2026-05-26T00:00:00.000Z",
            "modifiedDate": "2026-05-26T00:00:00.000Z",
            "fullPath": "/absolute/path/to/notes/welcome.md",
            "basename": "welcome.md",
            "titleOrBodyDates": ["2026.05.26"],
            "id": "welcome",
            "folder": "notes",
            "obsidianUrl": "obsidian://open?vault=vault-name&file=welcome",
            "frontmatter": {
              "topic": ["AI"],
              "created": "2026.05.26"
            },
            "content": {
              "type": "root",
              "children": [
                {
                  "type": "heading",
                  "depth": 1,
                  "children": [{ "type": "text", "value": "Welcome" }]
                }
              ]
            }
          }
        ]
      }
      ```
    - Notes without frontmatter return `"frontmatter": null`
    - Error responses: `500`
      ```json
      {
        "error": "app.config.json is required. Copy app.config.example.json to app.config.json."
      }
      ```
      ```json
      { "error": "Unable to load notes" }
      ```

- `apps/flag-manager`: Express-based Redis-backed API for per-ID feature flags.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /flags/:id/:flag`
    - Purpose: retrieve the current value of the named flag for the given ID
    - Success response: `200`
      ```json
      { "id": "note-1", "flag": "read", "value": false }
      ```
    - Error responses: `400`, `500`
      ```json
      { "error": "Both id and flag path params are required" }
      ```
      ```json
      { "error": "Flag \"read\" is not configured" }
      ```
      ```json
      { "error": "Unable to retrieve flag" }
      ```
  - `POST /flags/:id/:flag` and `PATCH /flags/:id/:flag`
    - Purpose: toggle the current value of the named flag for the given ID
    - Flags must be pre-configured in `app.config.json` (`flags` object)
    - Redis storage key format: `<flag>:<id>` (for example `read:note-1`)
    - Optional per-flag expiry: set `expiresInSeconds` to apply Redis TTL on each toggle
    - Success response: `200`
      ```json
      { "id": "note-1", "flag": "read", "value": true }
      ```
    - Error responses: `400`, `500`
      ```json
      { "error": "Both id and flag path params are required" }
      ```
      ```json
      { "error": "Flag \"read\" is not configured" }
      ```
      ```json
      { "error": "Unable to toggle flag" }
      ```
  - Sample curl commands:
    ```bash
    curl -X POST http://localhost/flags/note-1/read
    curl -X PATCH http://localhost/flags/note-1/read
    curl http://localhost/flags/note-1/read
    ```

- `apps/web`: React + TypeScript client using Chakra UI, TanStack Query, and React Router.
  - Routes: `/` and `/notes/:view`
  - `/notes/:view` resolves the view config by ID and renders the configured component (for example `NotesList` or `NotesReview`)
  - Configure the API base URL with `VITE_API_BASE_URL` (defaults to `http://localhost:3000`)

- `apps/image-server`: Express-based image proxy for note image assets backed by imgproxy.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /images?path=<relative-note-image-path>`
    - Purpose: validate local note image paths and redirect through imgproxy with default fit resizing
    - Success response: `307` redirect to imgproxy-backed path
    - Error responses: `400`
      ```json
      { "error": "A valid local image path is required" }
      ```

- `apps/habit-tracker`: Express-based API for tracking configurable habits scored from note frontmatter.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /habits`
    - Purpose: list every habit configured under `habits` in `app.config.json`, each with its current score, streak, mode, and `targetScore` — intended for rendering a lightweight overview (for example a grid of habit cards) without the per-habit cost of computing full history
    - `targetScore` is omitted from the response (rather than appearing as `null`) for habits where it isn't configured, since `JSON.stringify` drops `undefined` properties
    - Success response: `200`
      ```json
      [
        {
          "habitId": "exercise",
          "habitName": "Daily Exercise",
          "habitScore": 525,
          "mode": "do-more",
          "streak": 5
        },
        {
          "habitId": "drinking",
          "habitName": "drinking",
          "habitScore": 38,
          "mode": "do-less",
          "streak": 2,
          "targetScore": 100
        }
      ]
      ```
    - Sample curl command:
      ```bash
      curl http://localhost/habits
      ```
  - `GET /habit/:id`
    - Purpose: load the habit configured under `habits` in `app.config.json` (matched by `id`), scan notes for the configured `frontmatterProperty` (a numeric value from 1–10), and return the current score, streak, entry count, a point-in-time history for every day from the first matching note through today, a dedicated streak-period breakdown, and all-time highs
    - `mode` and `targetScore` are passed through from the habit's configuration. `targetScore` is only meaningful for `do-less` habits — it defines the score thresholds a UI can use to render a green/yellow/red status (for example a `targetScore` of `100` implies green for scores up to `50`, yellow up to `75`, and red from `75` upward) — and is omitted from the response (rather than appearing as `null`) when not configured, since `JSON.stringify` drops `undefined` properties
    - Scoring: sums frontmatter values from notes within the rolling `trackingWindowDays` window (entries from the last 14 days count at a 10x multiplier) to get a base total, then multiplies it by `(1 + dayMultiplier) * (1 + streakMultiplier)` — a 0.5%-per-day-with-an-entry adjustment and either a 0.5%-per-streak-day bonus (`do-more` mode) or penalty (`do-less` mode). Final scores are floored to whole numbers.
    - The top-level `streak` reflects the current streak as of the reference date. Its definition depends on mode:
      - `do-more` habits: the number of consecutive days (ending on the reference date) with an entry.
      - `do-less` habits: the number of days since the most recent entry (an entry on today's date resets it to `0`).
    - `streaks` is a dedicated breakdown of historical streak periods, each with `start`, `end`, and `length` (in days):
      - `do-more` habits: periods of consecutive days with a logged entry.
      - `do-less` habits: gaps of consecutive days without a logged entry that fall strictly between two logged entries (the time before the first entry and the ongoing gap since the most recent entry are excluded).
    - `allTimeHighStreak` is the longest `length` across all entries in `streaks`.
    - The current `habitScore` and each `history` entry's `habitScore` also include a score breakdown:
      - `rawScore`: the sum of entry values in the tracking window with no recency multiplier applied
      - `recentEntryAdditions`: the extra amount contributed by entries within the last 14 days (each counts at 10x, so this is `entry.value * 9` summed across those entries)
      - `scoreBeforeMultipliers`: `rawScore + recentEntryAdditions` — the base total before the day/streak adjustments are applied
      - `streakMultiplier`: the streak adjustment (`streak * 0.5%`) — positive for `do-more` habits (a long streak boosts the score) and negative for `do-less` habits (a long streak, i.e. going a long time without logging the habit, lowers the score)
      - `dayMultiplier`: the days-with-entries adjustment (`daysWithEntries * 0.5%`) — always positive in both modes; for `do-more` habits a high score is the goal, while for `do-less` habits a high score from frequent entries is undesirable
      - The final `habitScore` is `floor(scoreBeforeMultipliers * (1 + dayMultiplier) * (1 + streakMultiplier))` — the two adjustments are applied as multiplicative factors, not summed
    - `history` contains one entry for every calendar day from the first matching note through the reference date (inclusive) — not just days with a logged entry — so it can be plotted as a continuous score-over-time graph. Each entry also includes `streak` (the streak as of that day, using the same mode-specific definition as the top-level `streak`) and `value`, the frontmatter value logged that day (`0` on days with no entry; entries on the same date are summed)
    - `scoreEntries` is a per-entry breakdown of the entries contributing to the current `habitScore`, most recent first. Each entry has `date`, `value` (the raw frontmatter value logged that day), `recentMultiplier` — `10` if the entry falls within the last 14 days (and so contributes to `recentEntryAdditions`), or omitted otherwise — and `obsidianUrl`, an `obsidian://` deep link to the note the entry was read from
    - Success response: `200`
      ```json
      {
        "habitId": "exercise",
        "habitName": "Daily Exercise",
        "mode": "do-more",
        "windowStart": "2026-03-08",
        "habitScore": 525,
        "streak": 5,
        "windowEntries": 5,
        "rawScore": 50,
        "recentEntryAdditions": 450,
        "scoreBeforeMultipliers": 500,
        "streakMultiplier": 0.025,
        "dayMultiplier": 0.025,
        "history": [
          {
            "date": "2026-01-01",
            "habitScore": 100,
            "streak": 1,
            "windowEntries": 1,
            "windowStart": "2025-10-03",
            "value": 10,
            "rawScore": 10,
            "recentEntryAdditions": 90,
            "scoreBeforeMultipliers": 100,
            "streakMultiplier": 0.005,
            "dayMultiplier": 0.005
          },
          {
            "date": "2026-01-02",
            "habitScore": 0,
            "streak": 0,
            "windowEntries": 1,
            "windowStart": "2025-10-04",
            "value": 0,
            "rawScore": 10,
            "recentEntryAdditions": 90,
            "scoreBeforeMultipliers": 100,
            "streakMultiplier": 0,
            "dayMultiplier": 0.005
          }
        ],
        "streaks": [
          { "start": "2026-01-01", "end": "2026-01-05", "length": 5 }
        ],
        "scoreEntries": [
          { "date": "2026-03-12", "value": 10, "recentMultiplier": 10, "obsidianUrl": "obsidian://open?vault=notes&file=2026.03.12" },
          { "date": "2026-03-08", "value": 10, "obsidianUrl": "obsidian://open?vault=notes&file=2026.03.08" }
        ],
        "allTimeHighScore": 525,
        "allTimeHighStreak": 5,
        "allTimeHighWindowEntries": 5
      }
      ```
    - Error response (unknown habit id): `404`
      ```json
      { "error": "Habit not found: <id>" }
      ```
    - Sample curl command:
      ```bash
      curl http://localhost/habit/exercise
      ```

## Configuration

- Copy `app.config.example.json` to `app.config.json` at repository root.
- Set:
  - `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
  - `noteRootDirectory`: absolute path to your notes root directory.
  - `obsidianVault`: vault folder name under `noteRootDirectory`.
  - `views` (optional): array of view configs. Each view has:
    - `id`: route key used by `/notes/:view` and `GET /notes?view=<id>`
    - `name`: human-readable label shown in the UI
    - `component`: component name that the web app renders for that view (for example `NotesList` or `NotesReview`)
    - `filters`: array of filter groups. Within each standard group, conditions are ANDed; across standard groups, matches are ORed.
      - Use `{"$exclude": { ... }}` to define exclusion groups; exclusion groups are ANDed against all other filters.
      - Use `$missing` as a filter value to match notes where a property path is absent (for example `{"frontmatter.type": "$missing"}`).
    - `badges` (optional): array of note property paths to render as badges in the UI, such as `folder` or `frontmatter.type`
  - `flags`: object keyed by allowed flag names. Each flag definition supports optional `expiresInSeconds` (positive integer) to set Redis TTL, or omit it for non-expiring flags.
  - `habits` (optional): array of habit configs consumed by `apps/habit-tracker`'s `GET /habits` and `GET /habit/:id`. Each habit has:
    - `id`: route key used by `GET /habit/:id`
    - `name`: human-readable label returned in the response
    - `mode`: `"do-more"` or `"do-less"` — controls whether the streak adjustment (`streakMultiplier`) boosts or lowers the score; the days-with-entries adjustment (`dayMultiplier`) is always positive in both modes (see scoring details above)
    - `frontmatterProperty`: frontmatter key holding a numeric value from 1–10 to track
    - `trackingWindowDays`: size (in days) of the rolling window used to score the habit — must be a positive integer
    - `targetScore` (optional, positive number): only meaningful for `do-less` habits — defines the score thresholds a UI can use to render a green/yellow/red status. A `targetScore` of `100` implies green for scores up to `50` (50% of target), yellow up to `75` (75% of target), and red from `75` upward

## Docker Compose deployment

- `docker-compose.yml` runs:
  - `web` (nginx) on `http://localhost` for static web hosting + `/api` proxy
  - `notes-api` as an internal service on port `3000`
  - `flag-manager` as an internal service on port `3001`
  - `habit-tracker` as an internal service on port `3003`
  - `image-server` as an internal service on port `3002`
  - `imgproxy` as internal image optimizer used by `image-server`
  - `redis` as internal data storage for `flag-manager`
- nginx routes:
  - `/api/*` → `notes-api:3000/*`
  - `/flags/*` → `flag-manager:3001/flags/*`
  - `/habit/*` → `habit-tracker:3003/habit/*`
  - `/habits` → `habit-tracker:3003/habits`
  - `/images*` → `image-server:3002/images*`
  - `/imgproxy/*` → `imgproxy:8080/*` (used by `image-server` redirects)
- `app.config.json` is mounted into the `notes-api` and `habit-tracker` containers as `/app/app.config.json` (read-only).
- Configure `noteRootDirectory` in `app.config.json` using a path valid inside the container (for example `/data/notes`).
- Host notes are mounted into the `notes-api` and `habit-tracker` containers with `NOTES_ROOT`:
  - default: `./notes` on the host maps to `/data/notes`
  - override: `NOTES_ROOT=/absolute/path/on/host docker compose up --build`
- Host images are mounted into the image services with `IMAGES_ROOT`:
  - default: `./notes` on the host maps to `/data/images`
  - override: `IMAGES_ROOT=/absolute/path/on/host docker compose up --build`
- Notes markdown image paths now resolve through `/images?path=<encoded-relative-path>` for imgproxy optimization.
- If local and container config values differ, create a separate Docker-specific config file and mount it to `/app/app.config.json`.

Start services:

```bash
docker compose up --build
```

Optional future placeholder services are defined as `svc-x` and `svc-y` under the `future-services` profile.

## Scripts

Run from repository root:

- `turbo run lint` - run ESLint across workspaces
- `turbo run lint -- --fix` - run ESLint with auto-fixes where possible
- `turbo run build` - build workspace packages/apps
- `turbo run test` - run workspace tests
- `npm run docker:start` - start/update Docker services in detached mode with build
- `npm run docker:update` - pull images and rebuild/restart Docker services
- `npm run docker:stop` - stop Docker services
- `npm run changeset` - create a new changeset entry for user-visible changes
- `npm run changeset:version` - apply pending changesets (versions + changelog updates)

Equivalent npm script aliases are available: `npm run lint`, `npm run lint:fix`, `npm run build`, and `npm test`.

## Changesets workflow

- This repo uses [Changesets](https://github.com/changesets/changesets) for a single monorepo release track.
- All workspaces are configured in one fixed release group, so versioning stays aligned across the repo instead of separate package tracks.
- For user-visible changes, add a changeset in your PR (`npm run changeset`) and write a short summary of what changed.
- Run `npm run changeset:version` when preparing a release/changelog update to consume pending entries.

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

- `apps/habit-tracker`: Express-based API stub for habit data.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /habit/:key`
    - Purpose: placeholder route for loading a habit by key
    - Current response: `200`
      ```json
      {}
      ```
    - Sample curl command:
      ```bash
      curl http://localhost/habit/morning-routine
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
    - `layout` (optional): gallery layout mode — `"flex"` (default, CSS multi-column masonry where each card takes its natural height) or `"grid"` (uniform grid where all cards in a row share the same height). Only used by the `NotesGallery` component.
  - `flags`: object keyed by allowed flag names. Each flag definition supports optional `expiresInSeconds` (positive integer) to set Redis TTL, or omit it for non-expiring flags.

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
  - `/images*` → `image-server:3002/images*`
  - `/imgproxy/*` → `imgproxy:8080/*` (used by `image-server` redirects)
- `app.config.json` is mounted into the API container as `/app/app.config.json` (read-only).
- Configure `noteRootDirectory` in `app.config.json` using a path valid inside the container (for example `/data/notes`).
- Host notes are mounted into the API container with `NOTES_ROOT`:
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

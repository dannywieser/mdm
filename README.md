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
      - Purpose: recursively load `*.md` and `*.markdown` files from the directory resolved by `noteRootDirectory` + `obsidianVault` in `app.config.json`, extract optional frontmatter metadata, extract body dates using configured `dateFormats`, render markdown to HTML, and return note metadata
      - Optional query: `view=<name>` to apply a configured notes view filter
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
            "bodyDates": ["2026.05.26"],
            "id": "welcome",
            "folder": "notes",
            "frontmatter": {
              "topic": ["AI"],
              "created": "2026.05.26"
            },
            "html": "<h1>Welcome</h1>"
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
  - `POST /flags/:id/:flag` and `PATCH /flags/:id/:flag`
    - Purpose: toggle the named flag for the given ID
    - Redis storage key format: `<flag>:<id>` (for example `read:note-1`)
    - Success response: `200`
      ```json
      { "id": "note-1", "flag": "read", "value": true }
      ```
    - Error responses: `400`, `500`
      ```json
      { "error": "Both id and flag path params are required" }
      ```
      ```json
      { "error": "Unable to toggle flag" }
      ```

- `apps/web`: React + TypeScript client using Chakra UI, TanStack Query, and React Router.
  - Single route: `/`
  - Renders notes from `GET /notes` using `NotesList` and `NotesCard`
  - Configure the API base URL with `VITE_API_BASE_URL` (defaults to `http://localhost:3000`)

## Configuration

- Copy `app.config.example.json` to `app.config.json` at repository root.
- Set:
  - `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
  - `noteRootDirectory`: absolute path to your notes root directory.
  - `obsidianVault`: vault folder name under `noteRootDirectory`.
  - `views` (optional): array of named views. Each view has `name` and `filters` where filters match note fields (for example `"folder": "downtime"` and `"frontmatter.type": "book"`). All filters are applied inclusively.

## Docker Compose deployment

- `docker-compose.yml` runs:
  - `web` (nginx) on `http://localhost` for static web hosting + `/api` proxy
  - `notes-api` as an internal service on port `3000`
  - `flag-manager` as an internal service on port `3001`
  - `redis` as internal data storage for `flag-manager`
- nginx routes:
  - `/api/*` → `notes-api:3000/*`
  - `/flags/*` → `flag-manager:3001/flags/*`
- `app.config.json` is mounted into the API container as `/app/app.config.json` (read-only).
- Configure `noteRootDirectory` in `app.config.json` using a path valid inside the container (for example `/data/notes`).
- Host notes are mounted into the API container with `NOTES_ROOT`:
  - default: `./notes` on the host maps to `/data/notes`
  - override: `NOTES_ROOT=/absolute/path/on/host docker compose up --build`
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

Equivalent npm script aliases are available: `npm run lint`, `npm run lint:fix`, `npm run build`, and `npm test`.

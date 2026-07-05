# mdm

This repository is a Turborepo monorepo with this structure:

- `apps/` for runnable applications
- `packages/` for shared packages

## Current apps

- `apps/notes-api`: Express-based Node service with request logging via `morgan`. See [`apps/notes-api/README.md`](apps/notes-api/README.md).
- `apps/flag-manager`: Express-based Redis-backed API for per-ID feature flags. See [`apps/flag-manager/README.md`](apps/flag-manager/README.md).
- `apps/web`: React + TypeScript client using Chakra UI, TanStack Query, and React Router. See [`apps/web/README.md`](apps/web/README.md).
- `apps/demo-data`: generator for the static demo dataset. See [`apps/demo-data/README.md`](apps/demo-data/README.md). Builds a deterministic 1500+ note demo vault, then snapshots the real `notes-api` and `habit-tracker` responses into `apps/web/public/demo-data` for the GitHub Pages demo.
- `apps/image-server`: Express-based image proxy for note image assets backed by imgproxy. See [`apps/image-server/README.md`](apps/image-server/README.md).
- `apps/stats-service`: Express-based API for aggregate vault statistics. See [`apps/stats-service/README.md`](apps/stats-service/README.md).
- `apps/habit-tracker`: Express-based API for tracking configurable habits scored from note frontmatter. See [`apps/habit-tracker/README.md`](apps/habit-tracker/README.md).

## Configuration

- Copy `app.config.example.json` to `app.config.json` at repository root.
- Set:
  - `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
  - `noteRootDirectory`: absolute path to your notes root directory.
  - `obsidianVault`: vault folder name under `noteRootDirectory`.
- See each app's README for app-specific config fields (`views`, `flags`, `habits`, etc.).

## Docker Compose deployment

- `docker-compose.yml` runs:
  - `web` (nginx) on `http://localhost` for static web hosting + `/api` proxy
  - `notes-api` as an internal service on port `3000`
  - `flag-manager` as an internal service on port `3001`
  - `habit-tracker` as an internal service on port `3003`
  - `image-server` as an internal service on port `3002`
  - `stats-service` as an internal service on port `3004`
  - `imgproxy` as internal image optimizer used by `image-server`
  - `redis` as internal data storage for `flag-manager`
- nginx routes:
  - `/api/*` → `notes-api:3000/*`
  - `/flags/*` → `flag-manager:3001/flags/*`
  - `/habit/*` → `habit-tracker:3003/habit/*`
  - `/habits` → `habit-tracker:3003/habits`
  - `/images*` → `image-server:3002/images*`
  - `/stats/*` → `stats-service:3004/stats/*`
  - `/imgproxy/*` → `imgproxy:8080/*` (used by `image-server` redirects)
- `app.config.json` is mounted into the `notes-api`, `habit-tracker`, and `stats-service` containers as `/app/app.config.json` (read-only).
- Configure `noteRootDirectory` in `app.config.json` using a path valid inside the container (for example `/data/notes`).
- Host notes (and attachments) are mounted into all services with `NOTES_ROOT`:
  - default: `./notes` on the host maps to `/data/notes`
  - override: `NOTES_ROOT=/absolute/path/on/host docker compose up --build`
- Set `attachmentsDirectory` in `app.config.json` to the folder name (relative to `NOTES_ROOT`) where Obsidian stores attachments (e.g. `"attachments"`). Bare-filename images in notes resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>`.
- Notes markdown image paths now resolve through `/images?path=<encoded-relative-path>` for imgproxy optimization.
- If local and container config values differ, create a separate Docker-specific config file and mount it to `/app/app.config.json`.
- `notes-api`, `flag-manager`, `habit-tracker`, `image-server`, and `stats-service` each define a Docker healthcheck that polls their `/health` endpoint; `web` waits for all of them to report healthy before starting.

Start services:

```bash
docker compose up --build
```

Optional future placeholder services are defined as `svc-x` and `svc-y` under the `future-services` profile.

## Demo deployment (GitHub Pages)

`.github/workflows/deploy-pages.yml` deploys a fully static demo of `apps/web` to GitHub Pages on pushes to `main`, on a daily schedule (so date-relative views like `$today`/`$onThisDay` and habit streaks stay fresh), and on manual dispatch. The workflow:

1. Runs `npm run demo:data` to generate the demo vault and snapshot the `notes-api`/`habit-tracker` responses into `apps/web/public/demo-data` (see `apps/demo-data/README.md`).
2. Builds `apps/web` with `VITE_DEMO_MODE=true` and `VITE_BASE_PATH=/<repo-name>/`.
3. Copies `index.html` to `404.html` as a SPA fallback for client-side routes and publishes the `dist` folder to Pages.

In demo mode the web app reads all data from the static snapshot, and the redis-backed read flags are replaced with per-session browser storage (see `packages/services/README.md`). Enable Pages in the repository settings with "GitHub Actions" as the source.

Run the demo locally:

```bash
npm run demo:data   # generate vault + static snapshot
npm run demo:dev    # start the web app with VITE_DEMO_MODE=true
```

## Scripts

Run from repository root:

- `turbo run lint` - run ESLint across workspaces
- `turbo run lint -- --fix` - run ESLint with auto-fixes where possible
- `turbo run build` - build workspace packages/apps
- `turbo run test` - run workspace tests
- `npm run demo:data` - generate the demo vault and static demo data snapshot
- `npm run demo:dev` - run the web app in demo mode against the static snapshot
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

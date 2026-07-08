# Contributing to mdm

This guide covers running mdm locally and making changes to it. For coding conventions, testing guidelines, and the instructions this project's AI coding agent follows, see [`CLAUDE.md`](CLAUDE.md).

## Project structure

This repository is a Turborepo monorepo with:

- `apps/` for runnable applications
- `packages/` for shared packages

### Apps

- `apps/notes-api`: Express-based Node service with request logging via `pino-http`. See [`apps/notes-api/README.md`](apps/notes-api/README.md).
- `apps/flag-manager`: Express-based Redis-backed API for per-ID feature flags. See [`apps/flag-manager/README.md`](apps/flag-manager/README.md).
- `apps/web`: React + TypeScript client using Chakra UI, TanStack Query, and React Router. See [`apps/web/README.md`](apps/web/README.md).
- `apps/demo-data`: generator for the static demo dataset. See [`apps/demo-data/README.md`](apps/demo-data/README.md). Builds a deterministic 1500+ note demo vault, then snapshots the real `notes-api` and `habit-tracker` responses into `apps/web/public/demo-data` for the GitHub Pages demo.
- `apps/image-server`: Express-based image proxy for note image assets backed by imgproxy. See [`apps/image-server/README.md`](apps/image-server/README.md).
- `apps/stats-service`: Express-based API for aggregate vault statistics. See [`apps/stats-service/README.md`](apps/stats-service/README.md).
- `apps/habit-tracker`: Express-based API for tracking configurable habits scored from note frontmatter. See [`apps/habit-tracker/README.md`](apps/habit-tracker/README.md).

### Packages

- `packages/app-config`: reads, validates, and caches `app.config.json` + `NOTES_ROOT` into the resolved config every backend service consumes. See [`packages/app-config/README.md`](packages/app-config/README.md).
- `packages/markdown`: frontmatter parsing, date extraction, and vault file collection; owns the `Note` type. See [`packages/markdown/README.md`](packages/markdown/README.md).
- `packages/util` (`mdm-util`): dependency-free pure-function helpers (dates, strings, objects, promises, regex, IDs) shared across the repo, plus `./node` and `./redis` subpath exports. See [`packages/util/README.md`](packages/util/README.md).
- `packages/logger` (`mdm-logger`): shared `pino`-based structured logger factory used by every backend service. See [`packages/logger/README.md`](packages/logger/README.md).
- `packages/services`: shared TypeScript types and React Query hooks for the backend services, consumed by `apps/web`. See [`packages/services/README.md`](packages/services/README.md).

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` at the repository root, and set `NOTES_ROOT` to an absolute path to a local notes vault (any folder of `.md`/`.markdown` files works for testing).
3. Copy `app.config.example.json` to `app.config.json` at the repository root and set `obsidianVault` (see Configuration below for the full field list). Set `APP_CONFIG_PATH` in `.env` to this file's absolute path — each app runs from its own workspace directory, so it won't find this file by its own default relative lookup otherwise.
4. Run an app in dev/watch mode, e.g. `npm run dev --workspace=notes-api` or `npm run dev --workspace=web`, or `turbo run dev` to run every app at once.
5. Before committing, run `npm run verify` (lint, typecheck, build, and test across all workspaces) and fix anything it reports.

## Configuration

- Copy `app.config.example.json` to `app.config.json` at repository root.
- Set the `NOTES_ROOT` environment variable to an absolute path to your notes root directory — this replaces the vault path, it is not read from `app.config.json`.
- In `app.config.json`, set:
  - `dateFormats`: array of expected date patterns to extract from note bodies, such as `["YYYY.MM.DD", "YY/MM/DD"]`.
  - `obsidianVault`: vault folder name, used to build each note's `obsidianUrl` deep link.
  - `attachmentsDirectory` (optional): folder name (relative to `NOTES_ROOT`) where Obsidian stores attachments.
  - `createdDateProperty` (optional, defaults to `"created"`): frontmatter key treated as a note's created-date source.
  - `timezone` (optional, defaults to `"UTC"`): IANA timezone used for date-relative filters (`$today`/`$onThisDay`) and habit scoring.
- See each app's README for app-specific config fields (`views`, `flags`, `habits`, etc.).

## Running with Docker Compose

- `docker-compose.yml` runs:
  - `web` (nginx) on `http://localhost` for static web hosting + `/api` proxy
  - `notes-api` as an internal service on port `3000`
  - `flag-manager` as an internal service on port `3001`
  - `habit-tracker` as an internal service on port `3003`
  - `image-server` as an internal service on port `3002`
  - `stats-service` as an internal service on port `3004`
  - `imgproxy` as internal image optimizer used by `image-server`
  - `redis` as internal data storage shared by `flag-manager` and `image-server` (redirect cache)
- nginx routes:
  - `/api/*` → `notes-api:3000/*` (includes `/api/notes` and `/api/views`)
  - `/flags/*` → `flag-manager:3001/flags/*`
  - `/habits*` → `habit-tracker:3003/habits*` (covers both `GET /habits` and `GET /habits/:id`)
  - `/images*` → `image-server:3002/images*`
  - `/stats/*` → `stats-service:3004/stats/*`
  - `/imgproxy/*` → `imgproxy:8080/*` (used by `image-server` redirects)
  - nginx config also defines an `/habit/*` route to `habit-tracker:3003/habit/*`, but no endpoint at that singular path exists anymore (the API is `/habits/:id`) — this route is currently dead and unused by the web app
- `app.config.json` is mounted (read-only) into all 5 backend containers as `/app/app.config.json`: `notes-api`, `flag-manager`, `habit-tracker`, `stats-service`, and `image-server`. `image-server` doesn't currently read this file (it's configured entirely by environment variables — see `apps/image-server/README.md`), so the mount is a no-op for it today.
- The vault is mounted with `NOTES_ROOT` into the services that read notes directly: `notes-api`, `habit-tracker`, `stats-service`, `image-server`, and `imgproxy`. `flag-manager` (no vault access needed) and `web`/`redis` don't get this mount.
  - default: `./notes` on the host maps to `/data/notes`
  - override: `NOTES_ROOT=/absolute/path/on/host docker compose up --build`
- Each of those services also gets `NOTES_ROOT=/data/notes` set as an environment variable — that's how the container-side path is resolved (there's no `noteRootDirectory` field in `app.config.json` anymore).
- Set `attachmentsDirectory` in `app.config.json` to the folder name (relative to `NOTES_ROOT`) where Obsidian stores attachments (e.g. `"attachments"`). Bare-filename images in notes resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>`.
- Notes markdown image paths resolve through `/images?path=<encoded-relative-path>`, proxied by `image-server` to imgproxy for optimization.
- If local and container config values differ, create a separate Docker-specific config file and mount it to `/app/app.config.json`.
- Every image defines its own `HEALTHCHECK` (`notes-api`, `flag-manager`, `habit-tracker`, `image-server`, and `stats-service` poll their `/health` endpoint; `web` polls a static `/health` route added to the nginx config) so health status works the same whether the container is started via this compose file or run standalone. `web` waits for the 5 backend services to report healthy before starting.
- Each backend Dockerfile (`infra/docker/*.Dockerfile`) uses a multi-stage build with `turbo prune <app> --docker` so the image only contains that app's own workspace dependency subgraph, not the whole monorepo, and runs as the non-root `node` user. The runner stage also applies `apk upgrade` for the latest available OS package patches and removes the base image's bundled `npm`/`npx`/`corepack` (unused at runtime — the container only ever runs `node dist/server.js`), since Trivy's default library scan flags CVEs in npm's own bundled dependencies just as readily as the app's.
- Images are published to `ghcr.io/dannywieser/mdm-<app>` on every push to `main` (see `.github/workflows/docker-publish.yml`), tagged `latest`, `sha-<short-sha>`, and the app's `package.json` version. `docker-compose.yml` references these images directly (`image: ghcr.io/dannywieser/mdm-<app>:${MDM_IMAGE_TAG:-latest}`) alongside the local `build:` config, so `docker compose up --build` still builds from source, while `docker compose pull && docker compose up -d` runs the published images without needing the source checked out at all.
- Before publishing, each image is scanned with Trivy and the workflow fails (no push) if it finds a HIGH or CRITICAL vulnerability with a known fix.
- An opt-in `watchtower` service (behind the `watchtower` Compose profile — set `COMPOSE_PROFILES=watchtower` in `.env` to enable it) watches the 6 published `mdm-*` images (labeled `com.centurylinklabs.watchtower.enable=true`; `redis`/`imgproxy` are left unwatched) and automatically pulls + restarts any container when a new image is published, on a 1-hour poll. This replaces needing a cron job or host script running `docker compose pull && docker compose up -d` — the update-checking lives entirely in the stack. To disable it again, unset the profile and run `docker compose down watchtower` explicitly (re-running `up -d` alone isn't guaranteed to stop an already-running out-of-profile container).

Start services:

```bash
docker compose up --build
```

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
- `turbo run typecheck` - run the TypeScript compiler (no emit) across workspaces
- `turbo run build` - build workspace packages/apps
- `turbo run test` - run workspace tests
- `turbo run dev` - run workspace apps in dev/watch mode
- `npm run verify` - run lint, typecheck, build, and test across all workspaces; required before every commit
- `npm run demo:data` - generate the demo vault and static demo data snapshot
- `npm run demo:dev` - run the web app in demo mode against the static snapshot
- `npm run docker:start` - build from source and start/update Docker services in detached mode
- `npm run docker:update` - pull the published GHCR images and restart Docker services, without building from source
- `npm run docker:stop` - stop Docker services
- `npm run changeset` - create a new changeset entry for user-visible changes
- `npm run changeset:version` - apply pending changesets (versions + changelog updates)

Equivalent npm script aliases are available: `npm run lint`, `npm run lint:fix`, `npm run typecheck`, `npm run build`, `npm run test`, and `npm run dev`.

## Changesets workflow

- This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation.
- A fixed release group in `.changeset/config.json` keeps `app-config`, `markdown`, `mdm-util`, `notes-api`, and `web` versioned together. The remaining workspaces (`flag-manager`, `habit-tracker`, `image-server`, `stats-service`, `demo-data`, `services`, `mdm-logger`) are not in that group and version independently.
- For user-visible changes, add a changeset in your PR (`npm run changeset`) and write a short summary of what changed.
- Run `npm run changeset:version` when preparing a release/changelog update to consume pending entries.

## Submitting a pull request

- Make sure `npm run verify` passes.
- Add a `.changeset/*.md` entry for any user-visible change (see Changesets workflow above), or note in your PR description that none is needed.
- Follow the checklist in the pull request template.

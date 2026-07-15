# image-server

## 1.2.19

### Patch Changes

- mdm-util@3.0.0

## 1.2.18

### Patch Changes

- mdm-util@2.3.1

## 1.2.17

### Patch Changes

- Updated dependencies [5b101ab]
  - mdm-util@2.3.0

## 1.2.16

### Patch Changes

- mdm-util@2.2.4

## 1.2.15

### Patch Changes

- mdm-util@2.2.3

## 1.2.14

### Patch Changes

- mdm-util@2.2.2

## 1.2.13

### Patch Changes

- mdm-util@2.2.1

## 1.2.12

### Patch Changes

- mdm-util@2.2.0

## 1.2.11

### Patch Changes

- mdm-util@2.1.6

## 1.2.10

### Patch Changes

- mdm-util@2.1.5

## 1.2.9

### Patch Changes

- 7241f89: Removes the opt-in `watchtower` service and its labels from `docker-compose.yml`. Image updates are now manual only: run `docker compose pull && docker compose up -d --no-build` (or `npm run docker:update`) — `--no-build` avoids falling back to a source build when `docker-compose.yml`'s referenced Dockerfiles aren't present (e.g. a standalone install without a repo checkout).
  - mdm-util@2.1.4

## 1.2.8

### Patch Changes

- mdm-util@2.1.3

## 1.2.7

### Patch Changes

- mdm-util@2.1.2

## 1.2.6

### Patch Changes

- ab3fafb: Adds an opt-in `watchtower` service to `docker-compose.yml`, gated behind a `watchtower` Compose profile (`COMPOSE_PROFILES=watchtower` in `.env`). When enabled, it watches the 6 published `mdm-*` images (labeled explicitly; `redis`/`imgproxy` are left unwatched) and automatically pulls + restarts any container when a new image is published, replacing the need for a cron job or host script to keep a self-hosted deployment on the latest images.
- 48c544d: Switches the opt-in `watchtower` Compose service from `containrrr/watchtower` to `nickfedor/watchtower`, the actively maintained fork. The original image was archived unmaintained in December 2025 and fails against Docker Engine v29+ hosts with `client version 1.25 is too old`, since it ships a Docker client that predates the daemon's new minimum supported API version.
  - mdm-util@2.1.1

## 1.2.5

### Patch Changes

- Updated dependencies [2abe52c]
  - mdm-util@2.1.0

## 1.2.4

### Patch Changes

- b3996b4: All 5 backend services now handle SIGTERM/SIGINT gracefully: they stop accepting new connections, let in-flight requests finish, disconnect Redis where applicable (`flag-manager`, `image-server`), and force-exit after a 10s timeout if something hangs, instead of being hard-killed mid-request. This is implemented via a new shared `startServer` helper in `mdm-util/node` that also consolidates the near-identical `app.listen(...)` + logging boilerplate that was previously duplicated across all 5 `server.ts` files. `mdm-util`'s Redis client wrapper (`mdm-util/redis`) gains a `disconnect` method used during shutdown.
- 306e7bb: The new Trivy scan gate (added in a prior change) was failing on every push: Alpine OS packages (`libcrypto3`/`libssl3`, `musl`, `zlib`) with unpatched known CVEs, plus a full set of HIGH-severity CVEs in packages that turned out to be npm's own bundled dependencies (`glob`, `minimatch`, `tar`, `sigstore`, etc. at `/usr/local/lib/node_modules/npm`), not anything from the apps' own dependency trees. Each Dockerfile's runner stage now runs `apk upgrade` for the latest available OS patches and removes the base image's bundled `npm`/`npx`/`corepack`, since none of these images ever invoke npm at runtime (the container only runs `node dist/server.js`).
- a9c4d83: `/health` on every backend service now verifies its actual dependencies instead of always returning a static `{status:"ok"}`: `notes-api`, `habit-tracker`, `stats-service`, and `image-server` check that their vault/images directory is readable, and `flag-manager` pings Redis. Any of these return `503` with an error message on failure. `mdm-util`'s shared Redis client wrapper (`mdm-util/redis`) gains a `ping` method to support this. `notes-api` and `stats-service` also now fail fast and exit at startup if their config can't be resolved, instead of logging the error and continuing to serve requests in a broken state (matching `flag-manager`/`image-server`'s existing behavior).
- Updated dependencies [b3996b4]
- Updated dependencies [a9c4d83]
  - mdm-util@2.0.2

## 1.2.3

### Patch Changes

- 5e73d92: Rebuild all Docker images as minimal multi-stage builds using `turbo prune` (only ship each app's own dependency subgraph, run as non-root, `NODE_ENV=production`), add a `HEALTHCHECK` to every image so health status works standalone, and publish images to `ghcr.io/dannywieser/mdm-<app>` on every push to `main`. `docker-compose.yml` now references the published images alongside local `build:` config, and `npm run docker:update` pulls and restarts without rebuilding from source.
  - mdm-util@2.0.1

## 1.2.2

### Patch Changes

- Updated dependencies [fb9cd71]
- Updated dependencies [498a480]
  - mdm-util@2.0.0

## 1.2.1

### Patch Changes

- Updated dependencies [aad607c]
  - mdm-util@1.10.0

## 1.2.0

### Minor Changes

- 8e352f2: Replace morgan and console logging with Pino structured JSON logging across all backend services. Log level is controlled via the `LOG_LEVEL` environment variable (default: `info`).

### Patch Changes

- 3942cd8: Add stricter ESLint rule sets (strictTypeChecked, sonarjs, jsx-a11y, vitest, n) and fix all resulting errors across the monorepo.
  - mdm-util@1.9.0

## 1.1.4

### Patch Changes

- mdm-util@1.8.0

## 1.1.3

### Patch Changes

- mdm-util@1.7.0

## 1.1.2

### Patch Changes

- mdm-util@1.6.1

## 1.1.1

### Patch Changes

- ceb2a80: Add a max-height constraint to the imgproxy URL builder (default 768px) alongside the existing width cap (default 1024px). Both limits are overridable via `IMAGE_MAX_WIDTH` and `IMAGE_MAX_HEIGHT` environment variables. The Redis cache key now incorporates both dimensions so height changes invalidate stale entries.
- Updated dependencies [be835c4]
  - mdm-util@1.6.0

## 1.1.0

### Minor Changes

- 28e9b81: Cache imgproxy redirect URLs in Redis to avoid recomputing them on every request. TTL defaults to 86400 seconds (24h) and is configurable via the `IMAGE_CACHE_TTL_SECONDS` environment variable.

### Patch Changes

- bbc93bc: Add a max-height constraint to the imgproxy URL builder (default 768px) alongside the existing width cap (default 1024px). Both limits are overridable via `IMAGE_MAX_WIDTH` and `IMAGE_MAX_HEIGHT` environment variables. The Redis cache key now incorporates both dimensions so height changes invalidate stale entries.
  - mdm-util@1.5.0

## 1.0.4

### Patch Changes

- mdm-util@1.4.0

## 1.0.3

### Patch Changes

- mdm-util@1.3.0

## 1.0.2

### Patch Changes

- mdm-util@1.2.0

## 1.0.1

### Patch Changes

- Updated dependencies [e41efd1]
  - mdm-util@1.1.0

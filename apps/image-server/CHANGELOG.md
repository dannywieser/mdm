# image-server

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

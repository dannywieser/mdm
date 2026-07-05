# image-server

Express-based image proxy for note image assets backed by imgproxy.

## Endpoints

- `GET /health`
  - Purpose: basic service health check
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
- `GET /images?path=<relative-note-image-path>`
  - Purpose: validate a local note image path (rejecting external URLs and path traversal), then either redirect to an imgproxy-resized version or, when the proxy is disabled, serve the file directly
  - Successful redirect lookups are cached in Redis (keyed by resolved path + max width/height) so repeat requests skip the imgproxy URL build; Redis read/write failures are treated as non-fatal cache misses rather than errors
  - Success response: `307` redirect to the imgproxy-backed path (imgproxy enabled, the default), or `200` with the raw file streamed back (imgproxy disabled)
  - Error responses: `400`
    ```json
    { "error": "A valid local image path is required" }
    ```

## Configuration

This service does not read `app.config.json` — it is configured entirely via environment variables:

- `NOTES_ROOT` (default `/data/notes`): root directory image paths are resolved against. Notes markdown image paths resolve through `/images?path=<encoded-relative-path>` for optimization.
- `IMAGE_PROXY_ENABLED` (default `true`; set to the string `"false"` to disable): when disabled, matched images are served directly from disk instead of redirecting to imgproxy.
- `IMGPROXY_PATH_PREFIX` (default `/imgproxy`): path prefix prepended to the imgproxy redirect URL.
- `IMAGE_MAX_WIDTH` / `IMAGE_MAX_HEIGHT` (default `1024` / `768`): max dimensions passed to imgproxy's `fit` resize option.
- `IMAGE_CACHE_TTL_SECONDS` (default `86400`): Redis TTL for cached redirect URLs.
- `REDIS_URL` (default `redis://localhost:6379`): Redis connection string used for the redirect cache. If Redis is unreachable at startup, the service still starts with caching disabled (a no-op cache client) rather than failing.
- `PORT` (default `3002`): HTTP port the service listens on.

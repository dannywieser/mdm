# flag-manager

Express-based Redis-backed API for per-ID feature flags.

## Endpoints

- `GET /health`
  - Purpose: verifies Redis is reachable
  - Success response: `200`
    ```json
    { "status": "ok" }
    ```
  - Error response: `503` when Redis doesn't respond to a ping
    ```json
    { "status": "error", "error": "connection closed" }
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
  - Optional per-flag expiry: set `expiresInDays` to apply Redis TTL on each toggle
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

## Configuration

- `flags`: object keyed by allowed flag names. Each flag definition supports optional `expiresInDays` (positive integer) to set Redis TTL, or omit it for non-expiring flags.

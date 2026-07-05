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
  - Purpose: validate local note image paths and redirect through imgproxy with default fit resizing
  - Success response: `307` redirect to imgproxy-backed path
  - Error responses: `400`
    ```json
    { "error": "A valid local image path is required" }
    ```

## Configuration

- `attachmentsDirectory` in `app.config.json`: folder name (relative to `NOTES_ROOT`) where Obsidian stores attachments (e.g. `"attachments"`). Bare-filename images in notes resolve to `<attachmentsDirectory>/<noteDir>/<noteStem>/<filename>`.
- Notes markdown image paths resolve through `/images?path=<encoded-relative-path>` for imgproxy optimization.

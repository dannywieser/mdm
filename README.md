# mdm

This repository is a Turborepo monorepo with this structure:

- `apps/` for runnable applications
- `packages/` for shared packages

## Current app

- `apps/notes-api`: Express-based Node service with request logging via `morgan`.
  - `GET /health`
    - Purpose: basic service health check
    - Success response: `200`
      ```json
      { "status": "ok" }
      ```
  - `GET /notes`
    - Purpose: recursively load `*.md` and `*.markdown` files from the directory resolved by `noteRootDirectory` + `obsidianVault` in `app.config.json`, extract optional frontmatter metadata, render markdown to HTML, and return note metadata
    - Success response: `200`
      ```json
      {
        "notes": [
          {
            "createdDate": "2026-05-26T00:00:00.000Z",
            "modifiedDate": "2026-05-26T00:00:00.000Z",
            "fullPath": "/absolute/path/to/notes/welcome.md",
            "basename": "welcome.md",
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

## Configuration

- Copy `app.config.example.json` to `app.config.json` at repository root.
- Set:
  - `noteRootDirectory`: absolute path to your notes root directory.
  - `obsidianVault`: vault folder name under `noteRootDirectory`.

## Scripts

Run from repository root:

- `turbo run lint` - run ESLint across workspaces
- `turbo run lint -- --fix` - run ESLint with auto-fixes where possible
- `turbo run build` - build workspace packages/apps
- `turbo run test` - run workspace tests

Equivalent npm script aliases are available: `npm run lint`, `npm run lint:fix`, `npm run build`, and `npm test`.

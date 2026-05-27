@.github/copilot-instructions.md

## Codebase overview

`mdm` is a personal monorepo that exposes an Obsidian markdown vault as a JSON HTTP API. It is an npm workspaces + Turbo monorepo with two layers:

**Apps**
- `apps/notes-api` — Express 5 API. Two endpoints: `GET /health` and `GET /notes`. The notes endpoint recursively collects all `.md`/`.markdown` files from the configured vault directory, parses each one into a `Note` object (frontmatter, HTML body, body-extracted dates, file metadata), then optionally filters the result by a named view before returning JSON.

**Packages**
- `packages/app-config` — reads and validates `app.config.json` (searched upward from `cwd()`). Exposes `resolveNotesConfig()` which returns a cached `ResolvedNotesConfig` with `notesDirectory`, `obsidianVault`, `dateFormats`, and `views`. Config errors surface as `AppConfigError`.
- `packages/markdown` — low-level markdown utilities: `parseFrontMatter` (YAML front matter → `NoteFrontmatter`) and `parseMarkdownBodyDates` (extracts dates from note body text given configured format strings). Also owns the `Note` type used across the codebase.

**Config shape** (`app.config.json`):
- `noteRootDirectory` + `obsidianVault` → combined into `notesDirectory` (the vault root passed to the file walker)
- `dateFormats` — array of format strings used to find dates in note bodies
- `views` — named filters; each view has a `name` and a `filters` map of dot-path → expected value (e.g. `"frontmatter.type": "book"`). Callers pass `?view=<name>` to filter the response.

**Key data flow**: `GET /notes` → `resolveNotesConfig()` → `collectMarkdownFiles(notesDirectory)` → `parseMarkdownFile()` per file → `applyViewFilter()` → JSON response.

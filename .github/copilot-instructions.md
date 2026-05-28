# AI Agent Instructions

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

## general coding guidelines

- Favor the creation of small (<150 lines) files that are focused on a single purpose.
- Organize files into subdirectories based on related functions or domains.
- Never include types or interfaces in the same file as the implementation. Types should either live in a colocated file with a `.types.ts` suffix, or in a top level "types" folder if they are shared across multiple files.
- Split apart complex logic into small, pure functions with descriptive names. Avoid large functions that do many things; instead, break them down into smaller helper functions that can be easily tested and reused.
- after every change made, review the README file for the application or package and update it if necessary to reflect the changes made or remove any outdated information.
- When adding dependencies to `package.json`, always prefer pinning a specific version over fuzzy version matching.
- For user-visible changes, include a Changesets entry by running `npm run changeset` from the repository root and committing the generated `.changeset/*.md` file.

## express api guidelines

- The main service file should be focused on setting up the server, middleware, and routes, and should not contain any business logic. All handler logic should be contained in separate files under the `handlers` directory.
- When adding endpoints to services written in Express, place each handler in its own folder under `handlers/<handler-name>`, with the handler in `<handler-name>.ts`, tests in `<handler-name>.test.ts`, and helper functions in `<handler-name>.util.ts`.

## unit testing guidelines

- Use `test` (not `it`) in tests, and write descriptions that read naturally without implying an `it` prefix.
- All changes and additions to the codebase should be accompanied by appropriate unit tests that cover the new functionality and ensure that existing functionality is not broken. Tests should be written using Jest and should follow best practices for test organization and structure.
- Use the global Jest config (`clearMocks: true`) for mock cleanup; never call `jest.clearAllMocks()` manually in individual tests.
- Prefer mocking for all dependencies external to the file/unit being tested.
- In particular always mock platform libraries like `fs` and `path` when testing file handling logic, to avoid unintended side effects and ensure test reliability.

## util package guidelines

- The `util` package should only contain pure functions that are widely reusable across the codebase. It should not contain any functions that are specific to a particular domain or feature.
- When adding functions to the `util` package, ensure that they are well-documented with JSDoc comments that describe their purpose, parameters, and return values. This will help other developers understand how to use the functions and what to expect from them.
- Avoid adding functions to the `util` package that have dependencies on other parts of the codebase. If a function requires dependencies, it may be a sign that it belongs in a different package or module that is more closely related to its functionality.
- Example candidates for util: dates, strings, arrays, objects, validation, formatting, etc. Anything that is a pure function with no side effects and is not specific to the domain of notes or markdown parsing.

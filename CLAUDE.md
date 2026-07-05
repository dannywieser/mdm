# AI Agent Instructions

## Codebase overview

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

## On every change

- Run `npm run verify` from the repository root and fix any errors it reports.
- If a PR has been updated, review the PR description and update it to include the details of the change.
- Review this file (`CLAUDE.md`) to determine if any updates are required based on the change.
- Review the application README file to determine if any updates are required.

## general coding guidelines

- Favor the creation of small (<150 lines) files that are focused on a single purpose.
- Organize files into subdirectories based on related functions or domains.
- Never include types or interfaces in the same file as the implementation. Types should either live in a colocated file with a `.types.ts` suffix, or in a top level "types" folder if they are shared across multiple files.
- Never colocate a test file next to the module it tests. Instead, place it in a `__tests__` folder inside the same directory (e.g. `src/handlers/health/__tests__/health.test.ts` tests `src/handlers/health/health.ts`), and import the module under test with a relative path (e.g. `../health`).
- Split apart complex logic into small, pure functions with descriptive names. Avoid large functions that do many things; instead, break them down into smaller helper functions that can be easily tested and reused.
- after every change made, review the README file for the application or package and update it if necessary to reflect the changes made or remove any outdated information.
- When adding dependencies to `package.json`, always prefer pinning a specific version over fuzzy version matching.
- For user-visible changes, include a Changesets entry by running `npm run changeset` from the repository root and committing the generated `.changeset/*.md` file.
- Before every commit, run `npm run verify` from the repository root (runs lint, typecheck, build, and test via Turbo across all packages) and fix any errors it reports. Do not commit if it fails. Note that ESLint does not catch all TypeScript type errors, and the `build` script uses `tsconfig.build.json` which excludes test files — `verify` runs `typecheck` (which uses `tsconfig.json`) separately so type errors in test files are still caught.

## apps/web structure guidelines

- Keep each React component in `apps/web/src/components/<ComponentName>/` with colocated `<ComponentName>.tsx` and `<ComponentName>.types.ts` files, and its test at `apps/web/src/components/<ComponentName>/__tests__/<ComponentName>.test.tsx`.
- Keep each hook in `apps/web/src/hooks/<hookName>/` with colocated `<hookName>.ts` and `<hookName>.types.ts` files, and its test at `apps/web/src/hooks/<hookName>/__tests__/<hookName>.test.tsx`.
- Add a colocated `<name>.util.ts` file only when helper logic is needed by that component or hook. Every `.util.ts` must have a corresponding `<name>.util.test.ts` in the same directory's `__tests__` folder that tests its functions directly.
- For shared page chrome (like the app header), define it in a parent route layout so sibling routes (for example `/` and `/notes/:view`) render the same shell.

## changesets guidelines

A changeset is required for any PR that introduces a user-visible change. User-visible changes include:

- New or modified API behaviour (endpoints, request/response shapes, error handling)
- New features or significant enhancements in any app or package
- Bug fixes that affect observable runtime behaviour
- Changes to configuration, environment variables, or startup behaviour
- Changes to the Docker stack or deployment configuration

Changesets are **not** required for:

- Documentation-only changes (README, comments, JSDoc)
- Test-only changes (adding or updating test files with no production code changes)
- Pure refactors with no observable behaviour change
- CI/workflow-only changes (`.github/workflows/`, config files)

**Agent exit criteria**: before completing any task that touches production source files (`apps/`, `packages/`), you must either:

1. Create the changeset file manually — do **not** run `npm run changeset` (the interactive CLI does not work in non-TTY agent environments). Instead, write a file directly to `.changeset/<descriptive-slug>.md` with this frontmatter format:
   ```
   ---
   "web": patch
   ---
   One-sentence description of the user-visible change.
   ```
   Choose `patch`, `minor`, or `major` as appropriate, and commit the file alongside your other changes, **or**
2. Explicitly state in your final response why no changeset was needed (e.g. "test-only change — no changeset required").

## express api guidelines

- The main service file should be focused on setting up the server, middleware, and routes, and should not contain any business logic. All handler logic should be contained in separate files under the `handlers` directory.
- When adding endpoints to services written in Express, place each handler in its own folder under `handlers/<handler-name>`, with the handler in `<handler-name>.ts`, helper functions in `<handler-name>.util.ts`, and tests in `handlers/<handler-name>/__tests__/<handler-name>.test.ts`.
- When a PR adds or changes an API endpoint, its description must include, for each affected endpoint: the method + path (e.g. `GET /stats/meta`), and a success response example. Include error responses too when the endpoint has non-trivial failure modes.

## unit testing guidelines

- Use `test` (not `it`) in tests, and write descriptions that read naturally without implying an `it` prefix.
- All changes and additions to the codebase should be accompanied by appropriate unit tests that cover the new functionality and ensure that existing functionality is not broken. Tests should be written using Vitest and should follow best practices for test organization and structure.
- Use global Vitest config (`clearMocks: true`) for mock cleanup; never call manual global mock cleanup helpers in individual tests.
- Prefer mocking for all dependencies external to the file/unit being tested. In particular, a component's `.test.tsx` must mock its `.util.ts` module (via `vi.mock`) and assert on how the component uses the util's return values — the util's own logic is covered in `<name>.util.test.ts`, not in the component test.
- In particular always mock platform libraries like `fs` and `path` when testing file handling logic, to avoid unintended side effects and ensure test reliability.
- In `apps/web` tests, mock the i18n module so `t(...)`/`translate(...)` returns translation keys, and assert on keys instead of translated copy.

## util package guidelines

- The `util` package should only contain pure functions that are widely reusable across the codebase. It should not contain any functions that are specific to a particular domain or feature.
- When adding functions to the `util` package, ensure that they are well-documented with JSDoc comments that describe their purpose, parameters, and return values. This will help other developers understand how to use the functions and what to expect from them.
- Avoid adding functions to the `util` package that have dependencies on other parts of the codebase. If a function requires dependencies, it may be a sign that it belongs in a different package or module that is more closely related to its functionality.
- Example candidates for util: dates, strings, arrays, objects, validation, formatting, etc. Anything that is a pure function with no side effects and is not specific to the domain of notes or markdown parsing.
- Before writing any date-based logic (parsing, formatting, comparing, adding/subtracting days, building date ranges, etc.), first review the existing functions in `packages/util/src/date/` (e.g. `addDays`, `daysBetween`, `buildDateRange`, `getDateWindowStart`, `formatDate`, `getDateComponents`, `parseDateFromFormats`) and reuse them rather than writing new ad-hoc date arithmetic. If the logic you need doesn't exist yet but is generic and reusable (not specific to a domain like notes or habits), add it to `packages/util/src/date/` as its own pure function with colocated tests, following the conventions above, instead of inlining it elsewhere.

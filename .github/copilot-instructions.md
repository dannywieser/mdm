# AI Agent Instructions

## general coding guidelines

- Favor the creation of small (<150 lines) files that are focused on a single purpose.
- Organize files into subdirectories based on related functions or domains.
- Never include types or interfaces in the same file as the implementation. Types should either live in a colocated file with a `.types.ts` suffix, or in a top level "types" folder if they are shared across multiple files.
- Split apart complex logic into small, pure functions with descriptive names. Avoid large functions that do many things; instead, break them down into smaller helper functions that can be easily tested and reused.
- after every change made, review the README file for the application or package and update it if necessary to reflect the changes made or remove any outdated information.
- When adding dependencies to `package.json`, always prefer pinning a specific version over fuzzy version matching.

## express api guidelines

- The main service file should be focused on setting up the server, middleware, and routes, and should not contain any business logic. All handler logic should be contained in separate files under the `handlers` directory.
- When adding endpoints to services written in Express, place each handler in its own folder under `handlers/<handler-name>`, with the handler in `<handler-name>.ts`, tests in `<handler-name>.test.ts`, and helper functions in `<handler-name>.util.ts`.

## unit testing guidelines

- Use `test` (not `it`) in tests, and write descriptions that read naturally without implying an `it` prefix.
- All changes and additions to the codebase should be accompanied by appropriate unit tests that cover the new functionality and ensure that existing functionality is not broken. Tests should be written using Jest and should follow best practices for test organization and structure.
- Use the global Jest config (`clearMocks: true`) for mock cleanup; never call `jest.clearAllMocks()` manually in individual tests.
- Prefer mocking for all dependencies external to the file/unit being tested.
- In particular always mock platform libraries like `fs` and `path` when testing file handling logic, to avoid unintended side effects and ensure test reliability.

# Coding guidelines

- Favor the creation of small (<200 lines) files that are focused on a single purpose. Organize these files into subdirectories based on related functions or domains.
- Types that are specific to a single file should be located in a .types.ts file next to the source file.
- Package global types should be stored in a top level "types" folder, broken into domain specific files.
- Split apart complex logic into small, pure functions with descriptive names
- all new functions and files added should be covered by tests.
- For handler folders (`handlers/<name>/`), test utility logic in `<name>.util.test.ts`, and keep `<name>.test.ts` focused on handler interface behavior by mocking util functions.
- Use `test` (not `it`) in tests, and write descriptions that read naturally without implying an `it` prefix.
- When adding dependencies to `package.json`, always prefer pinning a specific version over fuzzy version matching.
- When adding endpoints to services written in Express, place each handler in its own folder under `handlers/<handler-name>`, with the handler in `<handler-name>.ts`, tests in `<handler-name>.test.ts`, and helper functions in `<handler-name>.util.ts`.
- after every change made, review the README file for the application or package and update it if necessary to reflect the changes made or remove any outdated information.

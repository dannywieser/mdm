# Coding guidelines

- Favor the creation of small (<200 lines) files that are focused on a single purpose. Organize these files into subdirectories based on related functions or domains.
- Types that are specific to a single file should be located in a .types.ts file next to the source file.
- Package global types should be stored in a top level "types" folder, broken into domain specific files.
- Split apart complex logic into small, pure functions with descriptive names
- Use `test` (not `it`) in tests, and write descriptions that read naturally without implying an `it` prefix.
- When adding dependencies to `package.json`, always prefer pinning a specific version over fuzzy version matching.
- When adding endpoints to services written in Express, extract each handler into its own file in a `handlers` directory within the Turborepo application.

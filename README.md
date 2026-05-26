# mdm

This repository is a Turborepo monorepo with this structure:

- `apps/` for runnable applications
- `packages/` for shared packages

## Current app

- `apps/notes-api`: Express-based Node service with a `GET /health` endpoint and request logging via `morgan`

## Scripts

Run from repository root:

- `turbo run lint` - run ESLint across workspaces
- `turbo run lint -- --fix` - run ESLint with auto-fixes where possible
- `turbo run build` - build workspace packages/apps
- `turbo run test` - run workspace tests

Equivalent npm script aliases are available: `npm run lint`, `npm run lint:fix`, `npm run build`, and `npm test`.

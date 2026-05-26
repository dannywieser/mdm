# mdm

This repository is a Turborepo monorepo with this structure:

- `apps/` for runnable applications
- `packages/` for shared packages

## Current app

- `apps/notes-api`: Express-based Node service with a `GET /health` endpoint and request logging via `morgan`

## Scripts

Run from repository root:

- `npm run lint` - run ESLint across workspaces through Turborepo
- `npm run lint:fix` - run ESLint with auto-fixes where possible
- `npm run build` - build workspace packages/apps
- `npm test` - run workspace tests

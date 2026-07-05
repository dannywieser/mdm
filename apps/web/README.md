# web

React + TypeScript client using Chakra UI, TanStack Query, and React Router.

## Routes

- `/` and `/notes/:view`
- `/notes/:view` resolves the view config by ID and renders the configured component (for example `NotesList` or `NotesReview`)

## Configuration

- Configure the API base URL with `VITE_API_BASE_URL` (defaults to `http://localhost:3000`)
- Demo mode: set `VITE_DEMO_MODE=true` to serve all data from the static JSON snapshot in `public/demo-data` (no backend services needed); see `apps/demo-data/README.md`
- `VITE_BASE_PATH` sets the Vite base for sub-path hosting (e.g. `/mdm/` on GitHub Pages)

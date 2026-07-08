# web

React + TypeScript client using Chakra UI, TanStack Query, and React Router.

## Routes

- `/` — home dashboard (view group overview, stats summary, notes review card)
- `/notes/:view` — resolves the view config by ID and renders the configured component (for example `NotesList` or `NotesReview`)
- `/tracking/:habitId` — habit detail page (score history, streaks, breakdown) for one configured habit
- `/stats` — aggregate vault statistics from `stats-service`, plus a per-year activity graph (one square per day, shaded by notes created/modified that day, sourced from `GET /stats/history`); years stack vertically, most recent first, with a hover card showing each day's created/modified/folders-touched counts. Shading scales relative to a typical day rather than the all-time max — days more than 5x the median active day (and at least 30) are flagged as outliers, shaded in their own graduated highlight color (so a mild outlier reads lighter than an extreme one) instead of washing out the rest of the scale.
- `/source/:noteId` — raw markdown source view for a note (used in demo mode in place of the Obsidian deep link)
- `/colors` — lets the user pick and preview one of the app's color palettes (see Configuration below)

## Configuration

- Backend base URLs, each defaulting to same-origin relative paths proxied by nginx (see `CONTRIBUTING.md`'s Docker Compose section):
  - `VITE_API_BASE_URL` (defaults to `/api`) — `notes-api`
  - `VITE_HABIT_API_BASE_URL` (defaults to `""`) — `habit-tracker`
  - `VITE_FLAGS_BASE_URL` (defaults to `/flags`) — `flag-manager`
  - `VITE_IMAGES_BASE_URL` (defaults to `""`) — `image-server`
  - `VITE_STATS_BASE_URL` (defaults to `/stats`) — `stats-service`
- Demo mode: set `VITE_DEMO_MODE=true` to serve all data from the static JSON snapshot in `public/demo-data` (no backend services needed, and the base URL vars above are ignored); see `apps/demo-data/README.md`
- `VITE_BASE_PATH` sets the Vite base for sub-path hosting (defaults to `/`; only needed if the GitHub Pages demo is ever moved off its custom domain back onto a `<user>.github.io/<repo>/` sub-path)
- Color palette: the app ships 8 selectable themes (dracula, gruvbox, nord, catppuccin, solarized, gotham, highContrast, ocean), each with its own light/dark variant, chosen via the header's palette selector or the `/colors` page and persisted across sessions

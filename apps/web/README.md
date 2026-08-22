# web

React + TypeScript client using Chakra UI, TanStack Query, and React Router.

## Routes

- `/` — home dashboard (view group overview, stats summary, notes review card). A view configured with `"component": "NotesGallery"` and `"dashboardPreview": true` renders as a full-width preview card instead of a compact stat card: the view's name and count above a photo pile of up to 10 covers, taken from the view's most recent notes that have an image. The covers are square-cornered prints with a white border, scattered and overlapping — each print's tilt and offset is derived from its note ID, so a pile looks random but never reshuffles between renders. Prints spread a fixed distance apart on a wide card and compress into a tighter pile on a narrow one; hovering or focusing one straightens and lifts it above the rest.
- `/notes/:view` — resolves the view config by ID and renders the configured component (for example `NotesList` or `NotesReview`)
- `/tracking/:habitId` — habit detail page (score history, streaks, breakdown) for one configured habit
- `/stats` — aggregate vault statistics from `stats-service`, plus a per-year activity graph (one square per day, shaded by notes created/modified that day, sourced from `GET /stats/history`); years stack vertically, most recent first, with a hover card showing each day's created/modified/folders-touched counts. Shading scales relative to a typical day rather than the all-time max — days more than 5x the median active day (and at least 30) are flagged as outliers, shaded in their own graduated highlight color (so a mild outlier reads lighter than an extreme one) instead of washing out the rest of the scale.
- `/calendar` and `/calendar/:month` — month-at-a-time transaction calendar from `transaction-tracker`. Each day block lists that day's transactions, both logged and scheduled, with the day's net total; scheduled entries carry a repeat icon and a dashed edge so a projected occurrence is never mistaken for one that happened. The month lives in the route, so months are linkable and the back button steps through the ones already visited; `/calendar` with no month is the current one. Paging forward is unbounded — the service projects recurrences into whatever month is requested, so there is no last month to reach. Each entry links to its source note, and the header shows the window's in/out/net totals.
- `/source/:noteId` — raw markdown source view for a note (used in demo mode in place of the Obsidian deep link)
- `/colors` — lets the user pick and preview one of the app's color palettes (see Configuration below)

## Configuration

- Backend base URLs, each defaulting to same-origin relative paths proxied by nginx (see `CONTRIBUTING.md`'s Docker Compose section):
  - `VITE_API_BASE_URL` (defaults to `/api`) — `notes-api`
  - `VITE_HABIT_API_BASE_URL` (defaults to `""`) — `habit-tracker`
  - `VITE_FLAGS_BASE_URL` (defaults to `/flags`) — `flag-manager`
  - `VITE_IMAGES_BASE_URL` (defaults to `""`) — `image-server`
  - `VITE_STATS_BASE_URL` (defaults to `/stats`) — `stats-service`
  - `VITE_TRANSACTIONS_BASE_URL` (defaults to `""`) — `transaction-tracker`
- Demo mode: set `VITE_DEMO_MODE=true` to serve all data from the static JSON snapshot in `public/demo-data` (no backend services needed, and the base URL vars above are ignored); see `apps/demo-data/README.md`
- `VITE_BASE_PATH` sets the Vite base for sub-path hosting (defaults to `/`; only needed if the GitHub Pages demo is ever moved off its custom domain back onto a `<user>.github.io/<repo>/` sub-path)
- Color palette: the app ships 8 selectable themes (dracula, gruvbox, nord, catppuccin, solarized, gotham, highContrast, ocean), each with its own light/dark variant (including the `positiveText`/`negativeText` tokens the calendar colors money in and out with), chosen via the header's palette selector or the `/colors` page and persisted across sessions
